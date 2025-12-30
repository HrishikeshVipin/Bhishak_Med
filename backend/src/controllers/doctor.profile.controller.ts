import { Request, Response } from 'express';
import prisma from '../config/database';
import { createAuditLog } from '../middleware/audit.middleware';
import fs from 'fs';
import path from 'path';

/**
 * Update doctor profile photo
 * PUT /api/doctor/profile/photo
 * Auth: Doctor only
 */
export const updateProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No profile photo uploaded',
      });
      return;
    }

    // Get current doctor to check existing profile photo
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { profilePhoto: true, fullName: true, email: true },
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }

    // Delete old profile photo if exists
    if (doctor.profilePhoto) {
      const oldPhotoPath = path.join(process.cwd(), doctor.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update profile photo path in database
    const profilePhotoPath = req.file.path.replace(/\\/g, '/');

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { profilePhoto: profilePhotoPath },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePhoto: true,
      },
    });

    // Note: Profile photo updates are not audited (low-risk self-service operation)

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (error: any) {
    console.error('Update profile photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile photo',
      error: error.message,
    });
  }
};

/**
 * Get doctor profile
 * GET /api/doctor/profile
 * Auth: Doctor only
 */
export const getDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        specialization: true,
        registrationType: true,
        registrationNo: true,
        registrationState: true,
        profilePhoto: true,
        digitalSignature: true,
        status: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndsAt: true,
        patientLimit: true,
        patientsCreated: true,
        monthlyVideoMinutes: true,
        purchasedMinutes: true,
        totalMinutesUsed: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { doctor },
    });
  } catch (error: any) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor profile',
      error: error.message,
    });
  }
};

/**
 * Upload doctor digital signature
 * PUT /api/doctor/profile/signature
 * Auth: Doctor only
 */
export const uploadDigitalSignature = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No signature image uploaded',
      });
      return;
    }

    // Get current doctor to check existing signature
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { digitalSignature: true, fullName: true, email: true },
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }

    // Delete old signature if exists
    if (doctor.digitalSignature) {
      const oldSignaturePath = path.join(process.cwd(), doctor.digitalSignature);
      if (fs.existsSync(oldSignaturePath)) {
        fs.unlinkSync(oldSignaturePath);
      }
    }

    // Update signature path in database
    const signaturePath = req.file.path.replace(/\\/g, '/');

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { digitalSignature: signaturePath },
      select: {
        id: true,
        fullName: true,
        email: true,
        digitalSignature: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Digital signature uploaded successfully',
      data: {
        doctor: updatedDoctor,
      },
    });
  } catch (error: any) {
    console.error('Upload digital signature error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload digital signature',
      error: error.message,
    });
  }
};

export default {
  updateProfilePhoto,
  uploadDigitalSignature,
  getDoctorProfile,
};
