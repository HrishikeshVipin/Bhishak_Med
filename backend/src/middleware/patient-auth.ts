import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface PatientAuthRequest extends Request {
  patient?: {
    id: string;
    phone: string;
    fullName: string;
    accountType: string;
  };
}

// Middleware to verify patient JWT token
export const authenticatePatient = async (
  req: PatientAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Please login.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      phone: string;
      fullName: string;
      accountType: string;
      type: string;
    };

    // Ensure token is for patient
    if (decoded.type !== 'patient') {
      res.status(403).json({
        success: false,
        message: 'Invalid token type',
      });
      return;
    }

    // Attach patient info to request
    req.patient = {
      id: decoded.id,
      phone: decoded.phone,
      fullName: decoded.fullName,
      accountType: decoded.accountType,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
      return;
    }

    console.error('Patient auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Optional: Middleware to check if patient phone is verified
export const requirePhoneVerified = (
  req: PatientAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.patient) {
    res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
    return;
  }

  // This would require querying the database to check phoneVerified status
  // For now, we assume that if they have a token, they're verified
  // You can add additional checks here if needed

  next();
};
