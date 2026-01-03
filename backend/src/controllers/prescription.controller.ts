import { Request, Response } from 'express';
import prisma from '../config/database';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cloudinary from '../config/cloudinary';
import { socketService } from '../services/socket.service';
import { encrypt, decrypt } from '../utils/encryption';
import { createAuditLog } from '../middleware/audit.middleware';

// Create prescription
export const createPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;
    const { diagnosis, medications, instructions } = req.body;

    // Verify consultation exists and belongs to doctor
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        doctor: {
          select: {
            id: true,
            email: true,
            fullName: true,
            specialization: true,
            registrationNo: true,
            phone: true,
            digitalSignature: true,
          },
        },
        patient: {
          select: {
            id: true,
            fullName: true,
            age: true,
            gender: true,
            status: true,
          },
        },
      },
    });

    if (!consultation) {
      res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
      return;
    }

    // Block prescription creation for waitlisted patients
    if (consultation.patient.status === 'WAITLISTED') {
      res.status(403).json({
        success: false,
        message: `Cannot create prescription. ${consultation.patient.fullName} is on the waiting list.`,
      });
      return;
    }

    // Check if prescription already exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { consultationId },
    });

    if (existingPrescription) {
      res.status(400).json({
        success: false,
        message: 'Prescription already exists for this consultation',
      });
      return;
    }

    // Encrypt sensitive prescription data before storing
    const encryptedDiagnosis = encrypt(diagnosis);
    const encryptedMedications = encrypt(JSON.stringify(medications || []));
    const encryptedInstructions = instructions ? encrypt(instructions) : null;

    // Create prescription with atomic serial number generation
    const prescription = await prisma.$transaction(async (tx) => {
      // 1. Increment doctor's serial number atomically
      const updatedDoctor = await tx.doctor.update({
        where: { id: consultation.doctorId },
        data: { lastPrescriptionSerial: { increment: 1 } },
        select: { lastPrescriptionSerial: true },
      });

      // 2. Create prescription with new serial number (ENCRYPTED)
      return await tx.prescription.create({
        data: {
          consultationId,
          doctorId: consultation.doctorId,
          serialNumber: updatedDoctor.lastPrescriptionSerial,
          diagnosis: encryptedDiagnosis, // ENCRYPTED
          medications: encryptedMedications, // ENCRYPTED
          instructions: encryptedInstructions, // ENCRYPTED
        },
      });
    });

    // Generate PDF
    const pdfPath = await generatePrescriptionPDF(prescription, consultation, diagnosis, medications, instructions);

    // Update prescription with PDF path
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data: { pdfPath },
    });

    // Log prescription creation in audit log
    await createAuditLog(req, {
      actorType: 'DOCTOR',
      actorId: consultation.doctorId,
      actorEmail: consultation.doctor.email || undefined,
      actorName: consultation.doctor.fullName,
      action: 'PRESCRIPTION_CREATE',
      resourceType: 'PRESCRIPTION',
      resourceId: updatedPrescription.id,
      description: `Prescription #${updatedPrescription.serialNumber} created for patient ${consultation.patient.fullName}`,
      metadata: {
        consultationId,
        patientId: consultation.patient.id,
        serialNumber: updatedPrescription.serialNumber,
      },
      success: true,
    });

    // Emit real-time event to consultation room
    socketService.emitPrescriptionUpdate(consultationId, {
      id: updatedPrescription.id,
      diagnosis,
      medications,
      instructions,
      pdfPath: updatedPrescription.pdfPath,
      serialNumber: updatedPrescription.serialNumber,
      createdAt: updatedPrescription.createdAt,
    });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription: updatedPrescription },
    });
  } catch (error: any) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating prescription',
      error: error.message,
    });
  }
};

// Get prescription by consultation ID
export const getPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { consultationId },
      include: {
        doctor: {
          select: {
            fullName: true,
            specialization: true,
            registrationNo: true,
          },
        },
      },
    });

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
      return;
    }

    // Decrypt and parse medications JSON string back to array
    let parsedMedications = [];
    try {
      const decryptedMedications = decrypt(prescription.medications);
      parsedMedications = JSON.parse(decryptedMedications);
    } catch (error) {
      console.error('Error decrypting/parsing medications:', error);
      parsedMedications = [];
    }

    const prescriptionWithParsedData = {
      ...prescription,
      medications: parsedMedications,
    };

    res.status(200).json({
      success: true,
      data: { prescription: prescriptionWithParsedData },
    });
  } catch (error: any) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription',
      error: error.message,
    });
  }
};

// Generate prescription PDF
async function generatePrescriptionPDF(
  prescription: any,
  consultation: any,
  diagnosis: string,
  medications: any[],
  instructions: string
): Promise<string> {
  // Pre-fetch signature image if it's a Cloudinary URL
  let signatureBuffer: Buffer | null = null;
  if (consultation.doctor.digitalSignature) {
    const signatureUrl = consultation.doctor.digitalSignature;
    const isCloudinaryUrl = signatureUrl.startsWith('http://') || signatureUrl.startsWith('https://');

    if (isCloudinaryUrl) {
      try {
        console.log('Fetching signature from Cloudinary:', signatureUrl);
        const response = await axios.get(signatureUrl, { responseType: 'arraybuffer' });
        signatureBuffer = Buffer.from(response.data, 'binary');
        console.log('Signature fetched successfully');
      } catch (error) {
        console.error('Error fetching signature from Cloudinary:', error);
        signatureBuffer = null;
      }
    }
  }

  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Save to persistent volume (Railway) or local filesystem (development)
      // In production (Railway), files are stored in mounted volume at /app/uploads
      const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');

      // Ensure directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `prescription_${prescription.id}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const relativePath = `uploads/prescriptions/${fileName}`;

      // Create write stream to save PDF
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('✅ Prescription PDF saved locally:', relativePath);
        resolve(relativePath);
      });

      writeStream.on('error', (error) => {
        console.error('❌ Error saving prescription PDF:', error);
        reject(error);
      });

      // App Header with Branding
      doc
        .fillColor('#1e3a8a') // Navy blue
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('MEDIQUORY CONNECT', { align: 'center' })
        .fillColor('#06b6d4') // Cyan
        .fontSize(10)
        .font('Helvetica')
        .text('Your Health, Our Priority', { align: 'center' })
        .moveDown(0.5);

      // Decorative line
      doc
        .strokeColor('#06b6d4')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();

      // Prescription Title and Serial Number
      doc
        .fillColor('#1e3a8a')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('MEDICAL PRESCRIPTION', 50, doc.y, { align: 'left' })
        .fontSize(12)
        .fillColor('#06b6d4')
        .text(`Rx #${prescription.serialNumber}`, { align: 'right' })
        .moveDown();

      // Date
      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica')
        .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, { align: 'right' })
        .moveDown();

      // Doctor Info Box
      doc
        .fillColor('#1e3a8a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('DOCTOR INFORMATION')
        .moveDown(0.3);

      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Dr. ${consultation.doctor.fullName}`, 70)
        .font('Helvetica')
        .fillColor('#444444')
        .text(`Specialization: ${consultation.doctor.specialization}`, 70)
        .text(`Registration No: ${consultation.doctor.registrationNo}`, 70)
        .text(`Phone: ${consultation.doctor.phone}`, 70)
        .moveDown();

      // Patient Info Box
      doc
        .fillColor('#1e3a8a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PATIENT INFORMATION')
        .moveDown(0.3);

      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Name: ${consultation.patient.fullName}`, 70)
        .font('Helvetica')
        .fillColor('#444444')
        .text(`Age: ${consultation.patient.age || 'N/A'} years  |  Gender: ${consultation.patient.gender || 'N/A'}`, 70)
        .moveDown(1.5);

      // Diagnosis Section
      doc
        .fillColor('#1e3a8a')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('DIAGNOSIS')
        .moveDown(0.3);

      doc
        .fillColor('#000000')
        .fontSize(10)
        .font('Helvetica')
        .text(diagnosis, 70, doc.y, { width: 480 })
        .moveDown(1.5);

      // Medications Section (Rx Symbol)
      if (medications && medications.length > 0) {
        doc
          .fillColor('#1e3a8a')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('℞  PRESCRIPTION MEDICATIONS')
          .moveDown(0.5);

        medications.forEach((med: any, index: number) => {
          // Medicine number and name
          doc
            .fillColor('#06b6d4')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`${index + 1}. ${med.name}`, 70);

          // Details in gray
          doc
            .fillColor('#444444')
            .fontSize(9)
            .font('Helvetica')
            .text(`Dosage: ${med.dosage}  |  Frequency: ${med.frequency}  |  Duration: ${med.duration}`, 85)
            .moveDown(0.7);
        });

        doc.moveDown(0.5);
      }

      // Instructions Section
      if (instructions) {
        doc
          .fillColor('#1e3a8a')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('SPECIAL INSTRUCTIONS')
          .moveDown(0.3);

        doc
          .fillColor('#000000')
          .fontSize(10)
          .font('Helvetica')
          .text(instructions, 70, doc.y, { width: 480 })
          .moveDown(1.5);
      }

      // Decorative line before footer
      doc
        .moveDown(2)
        .strokeColor('#06b6d4')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown(0.5);

      // Footer
      doc
        .fillColor('#444444')
        .fontSize(8)
        .font('Helvetica')
        .text(`Prescription #${prescription.serialNumber} | Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`, 50, doc.y, { align: 'left' })
        .moveDown(1.5);

      // Signature Section
      doc
        .fillColor('#000000')
        .fontSize(9)
        .font('Helvetica')
        .text('Doctor\'s Signature:', 350, doc.y);

      // If digital signature exists, embed it
      if (consultation.doctor.digitalSignature) {
        try {
          // Check if we have a pre-fetched buffer (Cloudinary) or need to load local file
          if (signatureBuffer) {
            // Use pre-fetched Cloudinary image
            doc
              .moveDown(0.3)
              .image(signatureBuffer, 350, doc.y, { width: 150, height: 50, fit: [150, 50] })
              .moveDown(2.5);
          } else {
            // Local path (backward compatibility)
            const signatureUrl = consultation.doctor.digitalSignature;
            const signaturePath = path.join(process.cwd(), signatureUrl);
            if (fs.existsSync(signaturePath)) {
              doc
                .moveDown(0.3)
                .image(signaturePath, 350, doc.y, { width: 150, height: 50, fit: [150, 50] })
                .moveDown(2.5);
            } else {
              // Fallback to line if file doesn't exist
              doc
                .moveDown(0.5)
                .strokeColor('#000000')
                .lineWidth(1)
                .moveTo(350, doc.y)
                .lineTo(500, doc.y)
                .stroke()
                .moveDown(0.3);
            }
          }
        } catch (error) {
          console.error('Error loading signature:', error);
          // Fallback to line on error
          doc
            .moveDown(0.5)
            .strokeColor('#000000')
            .lineWidth(1)
            .moveTo(350, doc.y)
            .lineTo(500, doc.y)
            .stroke()
            .moveDown(0.3);
        }
      } else {
        // No signature uploaded - show line
        doc
          .moveDown(0.5)
          .strokeColor('#000000')
          .lineWidth(1)
          .moveTo(350, doc.y)
          .lineTo(500, doc.y)
          .stroke()
          .moveDown(0.3);
      }

      doc
        .fillColor('#1e3a8a')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`Dr. ${consultation.doctor.fullName}`, 350, doc.y)
        .fillColor('#444444')
        .fontSize(8)
        .font('Helvetica')
        .text(consultation.doctor.specialization, 350, doc.y + 12);

      // Footer note
      doc
        .moveDown(3)
        .fillColor('#06b6d4')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('Mediquory Connect - Your Health, Our Priority', { align: 'center' })
        .fillColor('#444444')
        .fontSize(7)
        .font('Helvetica')
        .text('This is a digitally generated prescription', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      reject(error);
    }
  });
}

// Download prescription PDF
export const downloadPrescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prescriptionId } = req.params;
    const user = (req as any).user; // May be undefined if accessed without auth (public link)

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        consultation: {
          include: {
            paymentConfirmation: true,
            doctor: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!prescription || !prescription.pdfPath) {
      res.status(404).json({
        success: false,
        message: 'Prescription PDF not found',
      });
      return;
    }

    // Check if requester is the doctor who created the prescription
    const isDoctor = user && user.role === 'DOCTOR' && user.id === prescription.consultation.doctor.id;

    // Doctors can view anytime, patients/public need payment confirmation
    if (!isDoctor && !prescription.consultation.paymentConfirmation?.confirmedByDoctor) {
      res.status(403).json({
        success: false,
        message: 'Prescription can only be downloaded after payment confirmation',
      });
      return;
    }

    // Handle local filesystem storage
    const filePath = path.join(process.cwd(), prescription.pdfPath);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'Prescription file not found on server',
      });
      return;
    }

    // Log prescription download in audit log
    if (user) {
      await createAuditLog(req, {
        actorType: user.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.fullName,
        action: 'PRESCRIPTION_DOWNLOAD',
        resourceType: 'PRESCRIPTION',
        resourceId: prescription.id,
        description: `Prescription #${prescription.serialNumber} downloaded`,
        metadata: {
          consultationId: prescription.consultationId,
        },
        success: true,
      });
    }

    res.download(filePath, `prescription_${prescriptionId}.pdf`);
  } catch (error: any) {
    console.error('Download prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading prescription',
      error: error.message,
    });
  }
};

// Get patient consultation history with prescriptions
export const getPatientConsultationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const doctorId = (req as any).doctorId; // From auth middleware

    console.log('[DEBUG] Fetching patient history - Doctor:', doctorId, 'Patient:', patientId);

    // Verify patient belongs to this doctor
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      console.log('[ERROR] Patient not found:', patientId);
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    if (patient.doctorId !== doctorId) {
      console.log('[ERROR] Patient ownership mismatch. Patient doctorId:', patient.doctorId, 'Authenticated doctorId:', doctorId);
      res.status(403).json({
        success: false,
        message: 'Access denied: This patient does not belong to you',
      });
      return;
    }

    // Get all COMPLETED consultations with prescriptions
    const consultations = await prisma.consultation.findMany({
      where: {
        patientId,
        status: 'COMPLETED',
      },
      include: {
        prescription: {
          include: {
            doctor: {
              select: {
                fullName: true,
                specialization: true,
              },
            },
          },
        },
        paymentConfirmation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter consultations that have prescriptions and decrypt/parse medications
    const consultationsWithPrescriptions = consultations
      .filter((c) => c.prescription)
      .map((consultation) => {
        let parsedMedications = [];
        try {
          const decryptedMedications = decrypt(consultation.prescription!.medications);
          parsedMedications = JSON.parse(decryptedMedications);
        } catch (error) {
          console.error('Error decrypting/parsing medications in history:', error);
          parsedMedications = [];
        }

        return {
          id: consultation.id,
          date: consultation.createdAt,
          completedAt: consultation.completedAt,
          duration: consultation.duration,
          prescription: {
            id: consultation.prescription!.id,
            serialNumber: consultation.prescription!.serialNumber,
            diagnosis: consultation.prescription!.diagnosis,
            medications: parsedMedications,
            instructions: consultation.prescription!.instructions,
            createdAt: consultation.prescription!.createdAt,
            doctor: consultation.prescription!.doctor,
          },
          paymentConfirmed: consultation.paymentConfirmation?.confirmedByDoctor || false,
        };
      });

    res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          fullName: patient.fullName,
        },
        consultations: consultationsWithPrescriptions,
        count: consultationsWithPrescriptions.length,
      },
    });
  } catch (error: any) {
    console.error('Get patient consultation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation history',
      error: error.message,
    });
  }
};

// Copy prescription medications for reuse
export const copyPrescriptionMedications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prescriptionId } = req.params;
    const doctorId = (req as any).doctorId; // From auth middleware

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        consultation: {
          include: {
            patient: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
      return;
    }

    // Verify prescription belongs to this doctor
    if (prescription.doctorId !== doctorId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: This prescription does not belong to you',
      });
      return;
    }

    // Decrypt and parse medications for copying
    let parsedMedications = [];
    try {
      const decryptedMedications = decrypt(prescription.medications);
      parsedMedications = JSON.parse(decryptedMedications);
    } catch (error) {
      console.error('Error decrypting/parsing medications for copy:', error);
      parsedMedications = [];
    }

    // Return medications and diagnosis for copying
    res.status(200).json({
      success: true,
      message: 'Prescription data ready for copying',
      data: {
        prescription: {
          id: prescription.id,
          serialNumber: prescription.serialNumber,
          diagnosis: prescription.diagnosis,
          medications: parsedMedications,
          instructions: prescription.instructions,
          patientName: prescription.consultation.patient.fullName,
          createdAt: prescription.createdAt,
        },
        note: 'This data can be used to pre-fill a new prescription form',
      },
    });
  } catch (error: any) {
    console.error('Copy prescription medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error copying prescription',
      error: error.message,
    });
  }
};
