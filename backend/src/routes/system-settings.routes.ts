import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getSettings,
  getSettingValue,
  updateSetting,
  createSetting,
  deleteSetting,
} from '../controllers/system-settings.controller';

const router = Router();

// Public endpoint - Get a specific setting value (for feature flags)
router.get('/public/:key', getSettingValue);

// Admin-only endpoints
router.get('/', auth, getSettings); // Get all settings or specific by query ?key=X
router.post('/', auth, createSetting); // Create new setting
router.put('/:key', auth, updateSetting); // Update setting
router.delete('/:key', auth, deleteSetting); // Delete setting

export default router;
