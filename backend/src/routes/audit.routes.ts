import express from 'express';
import { getAuditLogs, getAdminAccessLogs, getAuditStats } from '../controllers/audit.controller';
import { verifyToken, isSuperAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Audit Log Routes
 * All routes require SUPER_ADMIN authentication
 * Regular admins cannot access audit logs for security reasons
 */

// Get general audit logs with filters (Super Admin only)
router.get('/audit-logs', verifyToken, isSuperAdmin, getAuditLogs);

// Get admin access logs - Aadhaar/UPI reveals, patient data access (Super Admin only)
router.get('/admin-access-logs', verifyToken, isSuperAdmin, getAdminAccessLogs);

// Get audit statistics (Super Admin only)
router.get('/audit-stats', verifyToken, isSuperAdmin, getAuditStats);

export default router;
