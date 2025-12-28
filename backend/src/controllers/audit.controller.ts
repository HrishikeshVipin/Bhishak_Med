import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get all audit logs with filters
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      actorType,
      action,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (actorType) {
      where.actorType = actorType;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { actorEmail: { contains: search as string, mode: 'insensitive' } },
        { actorName: { contains: search as string, mode: 'insensitive' } },
        { ipAddress: { contains: search as string } },
      ];
    }

    // Get total count and logs
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    // Enrich logs with admin role information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        if (log.actorType === 'ADMIN' && log.actorId) {
          // Fetch the admin to get their role
          const admin = await prisma.admin.findUnique({
            where: { id: log.actorId },
            select: { role: true },
          });

          return {
            ...log,
            actorRole: admin?.role || 'ADMIN', // SUPER_ADMIN or ADMIN
          };
        }
        return {
          ...log,
          actorRole: log.actorType, // DOCTOR, PATIENT, SYSTEM
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        logs: enrichedLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

/**
 * Get admin access logs with filters
 * GET /api/admin/admin-access-logs
 */
export const getAdminAccessLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '50',
      accessType,
      resourceType,
      reason,
      startDate,
      endDate,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (accessType) {
      where.accessType = accessType;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (reason) {
      where.reason = reason;
    }

    if (startDate || endDate) {
      where.accessedAt = {};
      if (startDate) {
        where.accessedAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.accessedAt.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { adminEmail: { contains: search as string, mode: 'insensitive' } },
        { adminName: { contains: search as string, mode: 'insensitive' } },
        { ipAddress: { contains: search as string } },
        { reasonDetails: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count and logs
    const [total, logs] = await Promise.all([
      prisma.adminAccessLog.count({ where }),
      prisma.adminAccessLog.findMany({
        where,
        orderBy: { accessedAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('Get admin access logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin access logs',
      error: error.message,
    });
  }
};

/**
 * Get audit log statistics
 * GET /api/admin/audit-stats
 */
export const getAuditStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // Get various statistics
    const [
      totalLogs,
      totalAdminAccessLogs,
      failedLogins,
      successfulLogins,
      prescriptionsCreated,
      paymentsConfirmed,
      aadhaarReveals,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.adminAccessLog.count({
        where: { accessedAt: { gte: startDate } },
      }),
      prisma.auditLog.count({
        where: {
          action: 'FAILED_LOGIN',
          createdAt: { gte: startDate },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          success: true,
          createdAt: { gte: startDate },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'PRESCRIPTION_CREATE',
          createdAt: { gte: startDate },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'PAYMENT_CONFIRM',
          createdAt: { gte: startDate },
        },
      }),
      prisma.adminAccessLog.count({
        where: {
          resourceType: 'DOCTOR',
          accessedAt: { gte: startDate },
        },
      }),
    ]);

    // Get recent failed logins for security monitoring
    const recentFailedLogins = await prisma.auditLog.findMany({
      where: {
        action: 'FAILED_LOGIN',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        actorEmail: true,
        ipAddress: true,
        createdAt: true,
        errorMessage: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalLogs,
          totalAdminAccessLogs,
          failedLogins,
          successfulLogins,
          prescriptionsCreated,
          paymentsConfirmed,
          aadhaarReveals,
        },
        recentFailedLogins,
        period: `Last ${daysNum} days`,
      },
    });
  } catch (error: any) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics',
      error: error.message,
    });
  }
};

export default {
  getAuditLogs,
  getAdminAccessLogs,
  getAuditStats,
};
