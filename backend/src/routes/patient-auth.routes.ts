import express from 'express';
import {
  sendOtp,
  verifyOtp,
  signup,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePin,
  getMyConsultations,
  getMyMedicalRecords,
} from '../controllers/patient-auth.controller';
import { authenticatePatient } from '../middleware/patient-auth';
import { checkPatientSignupEnabled } from '../middleware/checkPatientSignup';

const router = express.Router();

// Public routes (no auth required)
// Note: send-otp and signup are protected by feature flag
router.post('/send-otp', checkPatientSignupEnabled, sendOtp);
router.post('/verify-otp', verifyOtp); // Allow verification for existing users
router.post('/signup', checkPatientSignupEnabled, signup);
router.post('/login', login); // Always allow login for existing patients
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.get('/profile', authenticatePatient, getProfile);
router.put('/profile', authenticatePatient, updateProfile);
router.post('/change-pin', authenticatePatient, changePin);
router.get('/consultations', authenticatePatient, getMyConsultations);
router.get('/medical-records', authenticatePatient, getMyMedicalRecords);

export default router;
