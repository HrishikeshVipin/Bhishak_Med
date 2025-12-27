import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Audit Logging Middleware
 *
 * Logs all sensitive operations to AuditLog table:
 * - Login/Logout
 * - Prescription creation/download
 * - Payment confirmations
 * - Patient data access
 * - Failed login attempts
 * - Admin actions
 */

export interface AuditLogData {
  actorType: 'DOCTOR' | 'ADMIN' | 'PATIENT' | 'SYSTEM';
  actorId: string;
  actorEmail?: string;
  actorName?: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'PRESCRIPTION_CREATE'
    | 'PRESCRIPTION_DOWNLOAD'
    | 'PAYMENT_CONFIRM'
    | 'PATIENT_DATA_ACCESS'
    | 'DOCTOR_VERIFY'
    | 'DOCTOR_REJECT'
    | 'FAILED_LOGIN'
    | 'ADMIN_SETTINGS_CHANGE'
    | 'PATIENT_CREATE'
    | 'CONSULTATION_START'
    | 'CONSULTATION_COMPLETE'
    | 'VIDEO_CALL_START'
    | 'CONSULTATION_NOTES_UPDATE';
  resourceType?: 'PATIENT' | 'DOCTOR' | 'PRESCRIPTION' | 'PAYMENT' | 'CONSULTATION';
  resourceId?: string;
  description?: string;
  metadata?: any;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Create audit log entry
 * @param req - Express request object
 * @param data - Audit log data
 */
export async function createAuditLog(req: Request, data: AuditLogData): Promise<void> {
  try {
    // Extract IP address (handle proxies)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Extract user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorType: data.actorType,
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        actorName: data.actorName,
        action: data.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        description: data.description,
        ipAddress,
        userAgent,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
        success: data.success !== undefined ? data.success : true,
        errorMessage: data.errorMessage,
      },
    });

    console.log(`📋 Audit Log: ${data.actorType} ${data.actorId} - ${data.action}${data.resourceType ? ` on ${data.resourceType} ${data.resourceId}` : ''}`);
  } catch (error) {
    // Don't fail the request if audit logging fails, but log the error
    console.error('❌ Failed to create audit log:', error);
  }
}

/**
 * Admin Access Log - specific to admin viewing sensitive data
 * @param req - Express request object
 * @param adminId - Admin user ID
 * @param adminEmail - Admin email
 * @param adminName - Admin full name
 * @param accessType - Type of access
 * @param resourceType - Type of resource accessed
 * @param resourceId - ID of resource accessed
 * @param reason - Reason for access (REQUIRED)
 * @param reasonDetails - Additional explanation
 * @param action - Action taken (VIEW, EDIT, DELETE, EXPORT)
 */
export async function createAdminAccessLog(
  req: Request,
  {
    adminId,
    adminEmail,
    adminName,
    accessType,
    resourceType,
    resourceId,
    reason,
    reasonDetails,
    action,
  }: {
    adminId: string;
    adminEmail: string;
    adminName: string;
    accessType: 'PATIENT_VIEW' | 'PATIENT_MEDICAL_DATA' | 'DOCTOR_VIEW' | 'CONSULTATION_VIEW' | 'PRESCRIPTION_VIEW' | 'PAYMENT_VIEW';
    resourceType: 'PATIENT' | 'DOCTOR' | 'CONSULTATION' | 'PRESCRIPTION' | 'PAYMENT';
    resourceId: string;
    reason: 'LEGAL_REQUEST' | 'DISPUTE_RESOLUTION' | 'QUALITY_AUDIT' | 'TECHNICAL_SUPPORT' | 'USER_REQUEST';
    reasonDetails?: string;
    action: 'VIEW' | 'EDIT' | 'DELETE' | 'EXPORT';
  }
): Promise<void> {
  try {
    // Extract IP address (handle proxies)
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Extract user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Create admin access log
    await prisma.adminAccessLog.create({
      data: {
        adminId,
        adminEmail,
        adminName,
        accessType,
        resourceType,
        resourceId,
        reason,
        reasonDetails,
        ipAddress,
        userAgent,
        action,
      },
    });

    console.log(`🔐 Admin Access Log: ${adminName} (${adminEmail}) accessed ${resourceType} ${resourceId} - Reason: ${reason}`);
  } catch (error) {
    console.error('❌ Failed to create admin access log:', error);
  }
}

/**
 * Log Terms & Conditions acceptance
 * @param userType - Type of user (DOCTOR, PATIENT, ADMIN)
 * @param userId - User ID
 * @param userEmail - User email
 * @param termsType - Type of terms (TERMS_AND_CONDITIONS, PRIVACY_POLICY, CONSENT_FORM)
 * @param termsVersion - Version of terms (e.g., "v1.0")
 * @param req - Express request object
 */
export async function logTermsAcceptance(
  userType: 'DOCTOR' | 'PATIENT' | 'ADMIN',
  userId: string,
  userEmail: string | undefined,
  termsType: 'TERMS_AND_CONDITIONS' | 'PRIVACY_POLICY' | 'CONSENT_FORM',
  termsVersion: string,
  req: Request
): Promise<void> {
  try {
    // Extract IP address
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Extract user agent
    const userAgent = req.headers['user-agent'] || 'unknown';

    await prisma.termsAcceptance.create({
      data: {
        userType,
        userId,
        userEmail,
        termsType,
        termsVersion,
        ipAddress,
        userAgent,
      },
    });

    console.log(`📄 T&C Acceptance: ${userType} ${userId} accepted ${termsType} ${termsVersion}`);
  } catch (error) {
    console.error('❌ Failed to log terms acceptance:', error);
  }
}

/**
 * Middleware to attach audit logging function to request
 * Usage in controllers: req.auditLog({ ... })
 */
export function attachAuditLogger(req: Request, res: Response, next: NextFunction): void {
  // Attach audit log function to request object
  (req as any).auditLog = (data: AuditLogData) => createAuditLog(req, data);
  next();
}

/**
 * Express middleware for automatic audit logging based on route
 * Add this to routes that need automatic logging
 */
export function auditRoute(action: AuditLogData['action']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original send function
    const originalSend = res.send;

    // Override send to log after response
    res.send = function (data: any): Response {
      // Get user info from req.user (set by authenticateUser middleware)
      const user = (req as any).user;

      if (user) {
        createAuditLog(req, {
          actorType: user.role || 'PATIENT',
          actorId: user.id,
          actorEmail: user.email,
          actorName: user.fullName,
          action,
          success: res.statusCode >= 200 && res.statusCode < 300,
        }).catch(err => console.error('Audit log error:', err));
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
}

export default {
  createAuditLog,
  createAdminAccessLog,
  logTermsAcceptance,
  attachAuditLogger,
  auditRoute,
};
