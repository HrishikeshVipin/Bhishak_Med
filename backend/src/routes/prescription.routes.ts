import { Router } from 'express';
import { auth, optionalAuth } from '../middleware/auth';
import {
  createPrescription,
  getPrescription,
  downloadPrescription,
  getPatientConsultationHistory,
  copyPrescriptionMedications,
} from '../controllers/prescription.controller';
import { prescriptionLimiter } from '../middleware/rateLimiter';

const router = Router();

// Doctor routes
router.post('/:consultationId', auth, prescriptionLimiter, createPrescription);
router.get('/:consultationId', getPrescription);
router.get('/:prescriptionId/download', optionalAuth, downloadPrescription); // Optional auth to identify doctors
router.get('/patient/:patientId/history', auth, getPatientConsultationHistory);
router.get('/:prescriptionId/copy', auth, copyPrescriptionMedications);

export default router;
