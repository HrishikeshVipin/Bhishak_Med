import { Request, Response } from 'express';
import path from 'path';
import prisma from '../config/database';
import { socketService } from '../services/socket.service';
import { createAuditLog } from '../middleware/audit.middleware';

// Upload payment proof (patient)
export const uploadPaymentProof = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;
    const { amount } = req.body;
    const file = req.file;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
      return;
    }

    // Convert absolute file path to relative path for local storage
    const proofImagePath = file
      ? path.relative(process.cwd(), file.path).replace(/\\/g, '/')
      : null;

    // Create or update payment confirmation
    const payment = await prisma.paymentConfirmation.upsert({
      where: { consultationId },
      update: {
        amount: parseFloat(amount),
        proofImagePath,
      },
      create: {
        consultationId,
        amount: parseFloat(amount),
        proofImagePath,
        confirmedByDoctor: false,
      },
    });

    // Emit real-time event to consultation room (notify doctor)
    socketService.emitPaymentMade(consultationId, {
      id: payment.id,
      amount: payment.amount,
      proofImagePath: payment.proofImagePath,
      confirmedByDoctor: payment.confirmedByDoctor,
      createdAt: payment.createdAt,
    });

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: { payment },
    });
  } catch (error: any) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading payment proof',
      error: error.message,
    });
  }
};

// Confirm payment (doctor)
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
      return;
    }

    // Update payment confirmation
    const payment = await prisma.paymentConfirmation.update({
      where: { consultationId },
      data: {
        confirmedByDoctor: true,
        confirmedAt: new Date(),
      },
    });

    // Update consultation status to completed
    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Emit real-time event to consultation room (notify patient)
    socketService.emitPaymentConfirmed(consultationId, {
      id: payment.id,
      amount: payment.amount,
      confirmedByDoctor: payment.confirmedByDoctor,
      confirmedAt: payment.confirmedAt,
    });

    // Emit consultation completed event
    socketService.emitConsultationCompleted(consultationId, {
      id: consultationId,
      status: 'COMPLETED',
    });

    // Log payment confirmation in audit log
    const user = (req as any).user;
    if (user) {
      await createAuditLog(req, {
        actorType: 'DOCTOR',
        actorId: user.id,
        actorEmail: user.email,
        actorName: user.fullName,
        action: 'PAYMENT_CONFIRM',
        resourceType: 'PAYMENT',
        resourceId: payment.id,
        description: `Payment of ₹${payment.amount} confirmed for consultation`,
        metadata: {
          consultationId,
          amount: payment.amount,
        },
        success: true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment },
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message,
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { consultationId } = req.params;

    const payment = await prisma.paymentConfirmation.findUnique({
      where: { consultationId },
    });

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message,
    });
  }
};
