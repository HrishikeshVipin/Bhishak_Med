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

const router = express.Router();

// Public routes (no auth required)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes (require authentication)
router.get('/profile', authenticatePatient, getProfile);
router.put('/profile', authenticatePatient, updateProfile);
router.post('/change-pin', authenticatePatient, changePin);
router.get('/consultations', authenticatePatient, getMyConsultations);
router.get('/medical-records', authenticatePatient, getMyMedicalRecords);

export default router;
