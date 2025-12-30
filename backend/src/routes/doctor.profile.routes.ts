import express from 'express';
import { verifyToken, isDoctor } from '../middleware/auth';
import { uploadProfilePhoto, uploadDigitalSignature } from '../middleware/upload';
import { updateProfilePhoto, uploadDigitalSignature as uploadSignature, getDoctorProfile } from '../controllers/doctor.profile.controller';

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

/**
 * @route   PUT /api/doctor/profile/signature
 * @desc    Upload doctor digital signature
 * @access  Private (Doctor only)
 */
router.put('/signature', verifyToken, isDoctor, uploadDigitalSignature, uploadSignature);

export default router;
