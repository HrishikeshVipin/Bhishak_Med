import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if patient signup is enabled
 * Returns 403 with "Coming Soon" message if disabled
 */
export const checkPatientSignupEnabled = (req: Request, res: Response, next: NextFunction) => {
  const isEnabled = process.env.ENABLE_PATIENT_SIGNUP === 'true';

  if (!isEnabled) {
    return res.status(403).json({
      success: false,
      message: 'Patient registration is coming soon. For early access, please contact your doctor for an invite link.',
      code: 'PATIENT_SIGNUP_DISABLED',
    });
  }

  next();
};
