import { Router } from 'express';
import { validatePatientToken } from '../middleware/auth';
import { uploadMedicalFiles } from '../middleware/upload';
import {
  saveVitals,
  getVitalsHistory,
  uploadMedicalFile,
  getMedicalFiles,
} from '../controllers/vitals.controller';

const router = Router();

// Patient vitals routes (using patient access token)
router.post('/patients/:patientId/vitals', validatePatientToken, saveVitals);
router.get('/patients/:patientId/vitals', validatePatientToken, getVitalsHistory);

// Medical file upload routes (supports multiple files)
router.post('/patients/:patientId/files', validatePatientToken, uploadMedicalFiles.array('files', 10), uploadMedicalFile);
router.get('/patients/:patientId/files', validatePatientToken, getMedicalFiles);

export default router;
