import express from 'express';
import { revealAadhaar, revealUpiId } from '../controllers/admin.reveal.controller';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

/**
 * Admin Reveal Routes - Decrypt sensitive data for verification
 * Requires admin authentication
 * All actions logged in AdminAccessLog
 */

// Reveal Aadhaar for 15 seconds (with reason)
router.post('/reveal-aadhaar/:doctorId', verifyToken, revealAadhaar);

// Reveal UPI ID for 15 seconds (with reason)
router.post('/reveal-upi/:doctorId', verifyToken, revealUpiId);

export default router;
