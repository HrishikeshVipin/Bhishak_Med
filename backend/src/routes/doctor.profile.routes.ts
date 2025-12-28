import express from 'express';
import { verifyToken, isDoctor } from '../middleware/auth';
import { uploadProfilePhoto } from '../middleware/upload';
import { updateProfilePhoto, getDoctorProfile } from '../controllers/doctor.profile.controller';

const router = express.Router();

/**
 * @route   GET /api/doctor/profile
 * @desc    Get doctor profile
 * @access  Private (Doctor only)
 */
router.get('/', verifyToken, isDoctor, getDoctorProfile);

/**
 * @route   PUT /api/doctor/profile/photo
 * @desc    Update doctor profile photo
 * @access  Private (Doctor only)
 */
router.put('/photo', verifyToken, isDoctor, uploadProfilePhoto, updateProfilePhoto);

export default router;
