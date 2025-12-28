import { Router } from 'express';
import { verifyToken, isAdmin, isSuperAdmin } from '../middleware/auth';
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

// Admin endpoints - Both ADMIN and SUPER_ADMIN can view settings
router.get('/', verifyToken, isAdmin, getSettings); // Get all settings or specific by query ?key=X

// Super Admin only - Modify system settings
router.post('/', verifyToken, isSuperAdmin, createSetting); // Create new setting
router.put('/:key', verifyToken, isSuperAdmin, updateSetting); // Update setting
router.delete('/:key', verifyToken, isSuperAdmin, deleteSetting); // Delete setting

export default router;
