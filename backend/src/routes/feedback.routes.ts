import express from 'express';
import {
  submitFeedback,
  getMyFeedback,
  shouldPromptFeedback,
  getAllFeedback,
  updateFeedbackStatus,
} from '../controllers/feedback.controller';
import { verifyToken, isDoctor, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @route   POST /api/feedback/submit
 * @desc    Submit app feedback (doctor)
 * @access  Doctor
 */
router.post('/submit', verifyToken, isDoctor, submitFeedback);

/**
 * @route   GET /api/feedback/my-feedback
 * @desc    Get doctor's own feedback history
 * @access  Doctor
 */
router.get('/my-feedback', verifyToken, isDoctor, getMyFeedback);

/**
 * @route   GET /api/feedback/should-prompt
 * @desc    Check if doctor should see feedback prompt
 * @access  Doctor
 */
router.get('/should-prompt', verifyToken, isDoctor, shouldPromptFeedback);

/**
 * @route   GET /api/feedback/all
 * @desc    Get all feedback with filters (admin)
 * @access  Admin
 */
router.get('/all', verifyToken, isAdmin, getAllFeedback);

/**
 * @route   PUT /api/feedback/:id/status
 * @desc    Update feedback status (admin)
 * @access  Admin
 */
router.put('/:id/status', verifyToken, isAdmin, updateFeedbackStatus);

export default router;
