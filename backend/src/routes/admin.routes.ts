import { Router } from 'express';
import {
  getPlatformStats,
  getAllDoctors,
  getPendingDoctors,
  getDoctorById,
  verifyDoctor,
  rejectDoctor,
  suspendDoctor,
  reactivateDoctor,
  updateDoctorSubscription,
} from '../controllers/admin.controller';
import {
  getAllPlans,
  createPlan,
  updatePlan,
  deactivatePlan,
  activatePlan,
  grantFeaturesToDoctor,
  getPlanHistory,
  fixSubscriptionInconsistencies,
} from '../controllers/subscriptionPlanAdmin.controller';
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  toggleAdminActive,
} from '../controllers/admin-management.controller';
import { verifyToken, isAdmin, isSuperAdmin } from '../middleware/auth';

const router = Router();

// =============================================================================
// REGULAR ADMIN ROUTES (Both ADMIN and SUPER_ADMIN can access)
// =============================================================================

// Platform statistics
router.get('/stats', verifyToken, isAdmin, getPlatformStats);

// Doctor management
router.get('/doctors', verifyToken, isAdmin, getAllDoctors);
router.get('/doctors/pending', verifyToken, isAdmin, getPendingDoctors);
router.get('/doctors/:doctorId', verifyToken, isAdmin, getDoctorById);

// Doctor verification
router.put('/doctors/:doctorId/verify', verifyToken, isAdmin, verifyDoctor);
router.put('/doctors/:doctorId/reject', verifyToken, isAdmin, rejectDoctor);
router.put('/doctors/:doctorId/suspend', verifyToken, isAdmin, suspendDoctor);
router.put('/doctors/:doctorId/reactivate', verifyToken, isAdmin, reactivateDoctor);

// Subscription management (view and update doctor subscriptions)
router.put('/doctors/:doctorId/subscription', verifyToken, isAdmin, updateDoctorSubscription);

// View subscription plans (both admin levels can view)
router.get('/subscription-plans', verifyToken, isAdmin, getAllPlans);
router.get('/subscription-plans/:tier/history', verifyToken, isAdmin, getPlanHistory);

// =============================================================================
// SUPER ADMIN ONLY ROUTES
// =============================================================================

// Subscription plan management (create, modify, activate/deactivate)
router.post('/subscription-plans', verifyToken, isSuperAdmin, createPlan);
router.put('/subscription-plans/:planId', verifyToken, isSuperAdmin, updatePlan);
router.put('/subscription-plans/:planId/activate', verifyToken, isSuperAdmin, activatePlan);
router.put('/subscription-plans/:planId/deactivate', verifyToken, isSuperAdmin, deactivatePlan);

// Manual subscription overrides
router.put('/doctors/:doctorId/grant-features', verifyToken, isSuperAdmin, grantFeaturesToDoctor);
router.post('/subscription-plans/fix-inconsistencies', verifyToken, isSuperAdmin, fixSubscriptionInconsistencies);

// Admin management (Super Admin only)
router.post('/admins', verifyToken, isSuperAdmin, createAdmin); // Create new admin
router.get('/admins', verifyToken, isSuperAdmin, getAdmins); // Get all admins with filters
router.put('/admins/:adminId', verifyToken, isSuperAdmin, updateAdmin); // Update admin
router.delete('/admins/:adminId', verifyToken, isSuperAdmin, deleteAdmin); // Delete admin (soft)
router.put('/admins/:adminId/toggle-active', verifyToken, isSuperAdmin, toggleAdminActive); // Toggle active status

export default router;
