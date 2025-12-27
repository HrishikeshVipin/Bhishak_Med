import express from 'express';
import { getAuditLogs, getAdminAccessLogs, getAuditStats } from '../controllers/audit.controller';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * Audit Log Routes
 * All routes require admin authentication
 */

// Get general audit logs with filters
router.get('/audit-logs', verifyToken, isAdmin, getAuditLogs);

// Get admin access logs (Aadhaar/UPI reveals, patient data access)
router.get('/admin-access-logs', verifyToken, isAdmin, getAdminAccessLogs);

// Get audit statistics
router.get('/audit-stats', verifyToken, isAdmin, getAuditStats);

export default router;
