import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

/**
 * Middleware to check if patient signup is enabled
 * Checks database first, then falls back to environment variable
 * Returns 403 with "Coming Soon" message if disabled
 */
export const checkPatientSignupEnabled = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get setting from database first
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'ENABLE_PATIENT_SIGNUP' },
    });

    let isEnabled = false;

    if (setting) {
      // Database setting exists - use it
      isEnabled = setting.value === 'true';
      console.log(`🔧 Patient signup check: Database setting = ${isEnabled}`);
    } else {
      // Fallback to environment variable
      isEnabled = process.env.ENABLE_PATIENT_SIGNUP === 'true';
      console.log(`🔧 Patient signup check: Environment variable = ${isEnabled}`);
    }

    if (!isEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Patient registration is coming soon. For early access, please contact your doctor for an invite link.',
        code: 'PATIENT_SIGNUP_DISABLED',
      });
    }

    next();
  } catch (error) {
    // If database error, fallback to environment variable
    console.error('Error checking patient signup setting:', error);
    const isEnabled = process.env.ENABLE_PATIENT_SIGNUP === 'true';

    if (!isEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Patient registration is coming soon. For early access, please contact your doctor for an invite link.',
        code: 'PATIENT_SIGNUP_DISABLED',
      });
    }

    next();
  }
};
