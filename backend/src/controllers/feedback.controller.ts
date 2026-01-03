import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

// Validation schema for feedback submission
const feedbackSchema = z.object({
  type: z.enum(['FEATURE_REQUEST', 'BUG_REPORT', 'GENERAL_FEEDBACK', 'RATING']),
  rating: z.number().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  description: z.string().min(10).max(2000),
  category: z.enum(['UI/UX', 'PERFORMANCE', 'FEATURES', 'BUGS', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  deviceInfo: z.string().optional(),
});

/**
 * Submit app feedback (called by doctor)
 * POST /api/feedback/submit
 */
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId || (req as any).user?.id;

    if (!doctorId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const validatedData = feedbackSchema.parse(req.body);
    const { type, rating, title, description, category, priority, deviceInfo } = validatedData;

    // For RATING type, rating field is required
    if (type === 'RATING' && !rating) {
      res.status(400).json({
        success: false,
        message: 'Rating is required for RATING type feedback',
      });
      return;
    }

    // Get user agent from request headers
    const userAgent = req.headers['user-agent'] || undefined;

    // Create feedback
    const feedback = await prisma.appFeedback.create({
      data: {
        doctorId,
        type,
        rating: rating || null,
        title: title || null,
        description,
        category: category || null,
        priority: priority || 'MEDIUM',
        userAgent,
        deviceInfo: deviceInfo || null,
      },
      include: {
        doctor: {
          select: {
            fullName: true,
            email: true,
            specialization: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      data: { feedback },
    });
  } catch (error: any) {
    console.error('Submit feedback error:', error);

    if (error.name === 'ZodError') {
      res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message,
    });
  }
};

/**
 * Get doctor's own feedback history
 * GET /api/feedback/my-feedback
 */
export const getMyFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId || (req as any).user?.id;
    const { limit = 20, offset = 0 } = req.query;

    if (!doctorId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const feedback = await prisma.appFeedback.findMany({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.appFeedback.count({
      where: { doctorId },
    });

    res.status(200).json({
      success: true,
      data: {
        feedback,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      },
    });
  } catch (error: any) {
    console.error('Get my feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

/**
 * Check if doctor should see feedback prompt (periodic prompting logic)
 * GET /api/feedback/should-prompt
 */
export const shouldPromptFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).doctorId || (req as any).user?.id;

    if (!doctorId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Get last feedback submission
    const lastFeedback = await prisma.appFeedback.findFirst({
      where: { doctorId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, type: true },
    });

    // Prompt logic:
    // 1. If never submitted feedback -> prompt after 7 days
    // 2. If last feedback was a rating -> prompt again after 30 days
    // 3. If last feedback was not a rating -> prompt after 14 days
    const now = new Date();
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { createdAt: true },
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
      return;
    }

    let shouldPrompt = false;
    let daysSinceLastFeedback = 0;

    if (!lastFeedback) {
      // Calculate days since doctor signup
      const daysSinceSignup = Math.floor(
        (now.getTime() - doctor.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      shouldPrompt = daysSinceSignup >= 7;
      daysSinceLastFeedback = daysSinceSignup;
    } else {
      // Calculate days since last feedback
      daysSinceLastFeedback = Math.floor(
        (now.getTime() - lastFeedback.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (lastFeedback.type === 'RATING') {
        shouldPrompt = daysSinceLastFeedback >= 30; // Once a month for ratings
      } else {
        shouldPrompt = daysSinceLastFeedback >= 14; // Every 2 weeks for other feedback
      }
    }

    res.status(200).json({
      success: true,
      data: {
        shouldPrompt,
        daysSinceLastFeedback,
        lastFeedbackType: lastFeedback?.type || null,
      },
    });
  } catch (error: any) {
    console.error('Should prompt feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking feedback prompt status',
      error: error.message,
    });
  }
};

/**
 * Get all feedback (Admin only)
 * GET /api/feedback/all
 */
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, priority, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const feedback = await prisma.appFeedback.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            specialization: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.appFeedback.count({ where });

    // Get statistics
    const stats = {
      total,
      byType: {
        FEATURE_REQUEST: await prisma.appFeedback.count({ where: { type: 'FEATURE_REQUEST' } }),
        BUG_REPORT: await prisma.appFeedback.count({ where: { type: 'BUG_REPORT' } }),
        GENERAL_FEEDBACK: await prisma.appFeedback.count({ where: { type: 'GENERAL_FEEDBACK' } }),
        RATING: await prisma.appFeedback.count({ where: { type: 'RATING' } }),
      },
      byStatus: {
        PENDING: await prisma.appFeedback.count({ where: { status: 'PENDING' } }),
        ACKNOWLEDGED: await prisma.appFeedback.count({ where: { status: 'ACKNOWLEDGED' } }),
        IN_PROGRESS: await prisma.appFeedback.count({ where: { status: 'IN_PROGRESS' } }),
        RESOLVED: await prisma.appFeedback.count({ where: { status: 'RESOLVED' } }),
        WONT_FIX: await prisma.appFeedback.count({ where: { status: 'WONT_FIX' } }),
      },
      byPriority: {
        LOW: await prisma.appFeedback.count({ where: { priority: 'LOW' } }),
        MEDIUM: await prisma.appFeedback.count({ where: { priority: 'MEDIUM' } }),
        HIGH: await prisma.appFeedback.count({ where: { priority: 'HIGH' } }),
        CRITICAL: await prisma.appFeedback.count({ where: { priority: 'CRITICAL' } }),
      },
      averageRating: await prisma.appFeedback.aggregate({
        where: { type: 'RATING', rating: { not: null } },
        _avg: { rating: true },
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        feedback,
        stats,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      },
    });
  } catch (error: any) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message,
    });
  }
};

/**
 * Update feedback status (Admin only)
 * PUT /api/feedback/:id/status
 */
export const updateFeedbackStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    if (!['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'WONT_FIX'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const feedback = await prisma.appFeedback.update({
      where: { id },
      data: {
        status,
        adminResponse: adminResponse || undefined,
        resolvedAt: status === 'RESOLVED' || status === 'WONT_FIX' ? new Date() : undefined,
      },
      include: {
        doctor: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: { feedback },
    });
  } catch (error: any) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback status',
      error: error.message,
    });
  }
};

export default {
  submitFeedback,
  getMyFeedback,
  shouldPromptFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};
