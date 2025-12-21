import express from 'express';
import {
  searchDoctors,
  getDoctorPublicProfile,
  updateOnlineStatus,
  updateDoctorProfile,
  getSpecializations,
} from '../controllers/doctor-discovery.controller';
import { authenticateDoctor } from '../middleware/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/search', searchDoctors);
router.get('/specializations', getSpecializations);
router.get('/:doctorId/public', getDoctorPublicProfile);

// Protected routes (doctor auth required)
router.post('/online-status', authenticateDoctor, updateOnlineStatus);
router.put('/profile', authenticateDoctor, updateDoctorProfile);

export default router;
