import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { createAuditLog } from '../middleware/audit.middleware';

/**
 * Admin Management Controller
 *
 * SUPER_ADMIN only operations for managing admin accounts
 * - Create new admins
 * - View all admins
 * - Update admin roles/permissions
 * - Deactivate/activate admins
 * - Delete admins (soft delete)
 */

/**
 * Create a new admin account
 * POST /api/admin/admins
 * Body: { email, password, fullName, role }
 */
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role } = req.body;
    const currentAdmin = (req as any).user;

    // Validation
    if (!email || !password || !fullName || !role) {
      res.status(400).json({
        success: false,
        message: 'Email, password, fullName, and role are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Validate password strength (min 8 chars, uppercase, number)
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    if (!/[A-Z]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter',
      });
      return;
    }

    if (!/[0-9]/.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must contain at least one number',
      });
      return;
    }

    // Validate role
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      res.status(400).json({
        success: false,
        message: 'Role must be either ADMIN or SUPER_ADMIN',
      });
      return;
    }

    // Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      res.status(409).json({
        success: false,
        message: 'An admin with this email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log admin creation
    await createAuditLog(req, {
      actorType: 'ADMIN',
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorName: currentAdmin.fullName || 'Super Admin',
      action: 'CREATE_ADMIN',
      description: `Created new ${role} account for ${fullName} (${email})`,
      success: true,
      metadata: {
        newAdminId: newAdmin.id,
        newAdminEmail: newAdmin.email,
        newAdminRole: newAdmin.role,
      },
    });

    console.log(`✅ Super Admin ${currentAdmin.email} created new ${role}: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin: newAdmin },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message,
    });
  }
};

/**
 * Get all admins with optional filters
 * GET /api/admin/admins?role=ADMIN&isActive=true&page=1&limit=20
 */
export const getAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isActive, page = '1', limit = '20' } = req.query;

    // Build filter conditions
    const where: any = {};

    if (role && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get admins with pagination
    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.admin.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message,
    });
  }
};

/**
 * Update admin details (name, role, isActive)
 * PUT /api/admin/admins/:adminId
 * Body: { fullName?, role?, isActive? }
 */
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminId } = req.params;
    const { fullName, role, isActive } = req.body;
    const currentAdmin = (req as any).user;

    // Prevent self-modification
    if (adminId === currentAdmin.id) {
      res.status(403).json({
        success: false,
        message: 'You cannot modify your own admin account. Ask another Super Admin to make changes.',
      });
      return;
    }

    // Find target admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetAdmin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Validate role if provided
    if (role && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      res.status(400).json({
        success: false,
        message: 'Role must be either ADMIN or SUPER_ADMIN',
      });
      return;
    }

    // Prevent demoting the last SUPER_ADMIN
    if (role === 'ADMIN' && targetAdmin.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.admin.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (superAdminCount <= 1) {
        res.status(403).json({
          success: false,
          message: 'Cannot demote the last active Super Admin. Promote another admin first.',
        });
        return;
      }
    }

    // Prevent deactivating the last SUPER_ADMIN
    if (isActive === false && targetAdmin.role === 'SUPER_ADMIN') {
      const activeSuperAdminCount = await prisma.admin.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (activeSuperAdminCount <= 1) {
        res.status(403).json({
          success: false,
          message: 'Cannot deactivate the last active Super Admin. Activate another Super Admin first.',
        });
        return;
      }
    }

    // Build update data
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    // Build change description
    const changes: string[] = [];
    if (fullName && fullName !== targetAdmin.fullName) {
      changes.push(`name: "${targetAdmin.fullName}" → "${fullName}"`);
    }
    if (role && role !== targetAdmin.role) {
      changes.push(`role: ${targetAdmin.role} → ${role}`);
    }
    if (isActive !== undefined && isActive !== targetAdmin.isActive) {
      changes.push(`status: ${targetAdmin.isActive ? 'active' : 'inactive'} → ${isActive ? 'active' : 'inactive'}`);
    }

    // Log admin update
    await createAuditLog(req, {
      actorType: 'ADMIN',
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorName: currentAdmin.fullName || 'Super Admin',
      action: 'UPDATE_ADMIN',
      description: `Updated admin ${targetAdmin.email}: ${changes.join(', ')}`,
      success: true,
      metadata: {
        targetAdminId: adminId,
        targetAdminEmail: targetAdmin.email,
        changes: updateData,
      },
    });

    console.log(`✅ Super Admin ${currentAdmin.email} updated admin ${targetAdmin.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: updatedAdmin },
    });
  } catch (error: any) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin',
      error: error.message,
    });
  }
};

/**
 * Delete admin (soft delete - set isActive to false)
 * DELETE /api/admin/admins/:adminId
 */
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminId } = req.params;
    const currentAdmin = (req as any).user;

    // Prevent self-deletion
    if (adminId === currentAdmin.id) {
      res.status(403).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
      return;
    }

    // Find target admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetAdmin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Prevent deleting the last SUPER_ADMIN
    if (targetAdmin.role === 'SUPER_ADMIN') {
      const activeSuperAdminCount = await prisma.admin.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (activeSuperAdminCount <= 1) {
        res.status(403).json({
          success: false,
          message: 'Cannot delete the last active Super Admin. Promote another admin first.',
        });
        return;
      }
    }

    // Soft delete - set isActive to false
    await prisma.admin.update({
      where: { id: adminId },
      data: { isActive: false },
    });

    // Log admin deletion
    await createAuditLog(req, {
      actorType: 'ADMIN',
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorName: currentAdmin.fullName || 'Super Admin',
      action: 'DELETE_ADMIN',
      description: `Deleted ${targetAdmin.role} account: ${targetAdmin.fullName} (${targetAdmin.email})`,
      success: true,
      metadata: {
        deletedAdminId: adminId,
        deletedAdminEmail: targetAdmin.email,
        deletedAdminRole: targetAdmin.role,
      },
    });

    console.log(`🗑️ Super Admin ${currentAdmin.email} deleted admin ${targetAdmin.email}`);

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message,
    });
  }
};

/**
 * Toggle admin active status (quick activate/deactivate)
 * PUT /api/admin/admins/:adminId/toggle-active
 */
export const toggleAdminActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { adminId } = req.params;
    const currentAdmin = (req as any).user;

    // Prevent self-toggle
    if (adminId === currentAdmin.id) {
      res.status(403).json({
        success: false,
        message: 'You cannot toggle your own active status.',
      });
      return;
    }

    // Find target admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetAdmin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // If deactivating a SUPER_ADMIN, check count
    if (targetAdmin.isActive && targetAdmin.role === 'SUPER_ADMIN') {
      const activeSuperAdminCount = await prisma.admin.count({
        where: { role: 'SUPER_ADMIN', isActive: true },
      });

      if (activeSuperAdminCount <= 1) {
        res.status(403).json({
          success: false,
          message: 'Cannot deactivate the last active Super Admin.',
        });
        return;
      }
    }

    // Toggle isActive
    const newStatus = !targetAdmin.isActive;

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: { isActive: newStatus },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    // Log toggle action
    await createAuditLog(req, {
      actorType: 'ADMIN',
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      actorName: currentAdmin.fullName || 'Super Admin',
      action: newStatus ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN',
      description: `${newStatus ? 'Activated' : 'Deactivated'} admin: ${targetAdmin.fullName} (${targetAdmin.email})`,
      success: true,
      metadata: {
        targetAdminId: adminId,
        targetAdminEmail: targetAdmin.email,
        newStatus,
      },
    });

    console.log(`🔄 Super Admin ${currentAdmin.email} ${newStatus ? 'activated' : 'deactivated'} admin ${targetAdmin.email}`);

    res.status(200).json({
      success: true,
      message: `Admin ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { admin: updatedAdmin },
    });
  } catch (error: any) {
    console.error('Toggle admin active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle admin status',
      error: error.message,
    });
  }
};

export default {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  toggleAdminActive,
};
