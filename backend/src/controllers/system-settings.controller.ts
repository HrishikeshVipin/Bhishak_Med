import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Get all system settings or a specific setting by key
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (key) {
      // Get specific setting
      const setting = await prisma.systemSetting.findUnique({
        where: { key: key as string },
      });

      if (!setting) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found',
        });
      }

      return res.json({
        success: true,
        data: setting,
      });
    }

    // Get all settings
    const settings = await prisma.systemSetting.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
    });
  }
};

/**
 * Get a specific setting value by key (public endpoint for checking feature flags)
 */
export const getSettingValue = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const setting = await prisma.systemSetting.findUnique({
      where: { key },
      select: { value: true, type: true },
    });

    if (!setting) {
      // Return env variable as fallback
      const envValue = process.env[key];
      return res.json({
        success: true,
        data: {
          value: envValue || 'false',
          source: 'environment',
        },
      });
    }

    // Parse value based on type
    let parsedValue: any = setting.value;
    if (setting.type === 'BOOLEAN') {
      parsedValue = setting.value === 'true';
    } else if (setting.type === 'NUMBER') {
      parsedValue = parseFloat(setting.value);
    } else if (setting.type === 'JSON') {
      parsedValue = JSON.parse(setting.value);
    }

    res.json({
      success: true,
      data: {
        value: parsedValue,
        source: 'database',
      },
    });
  } catch (error) {
    console.error('Get setting value error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get setting value',
    });
  }
};

/**
 * Update a system setting (Admin only)
 */
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = (req as any).user?.id;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Value is required',
      });
    }

    // Check if setting exists
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    // Validate value based on type
    let stringValue = String(value);
    if (existingSetting.type === 'BOOLEAN') {
      stringValue = value === true || value === 'true' ? 'true' : 'false';
    } else if (existingSetting.type === 'JSON') {
      try {
        JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
        stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON value',
        });
      }
    }

    // Update setting
    const updated = await prisma.systemSetting.update({
      where: { key },
      data: {
        value: stringValue,
        updatedBy: adminId,
      },
    });

    console.log(`✅ Admin ${adminId} updated setting ${key} to ${stringValue}`);

    res.json({
      success: true,
      data: updated,
      message: 'Setting updated successfully',
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
    });
  }
};

/**
 * Create a new system setting (Admin only)
 */
export const createSetting = async (req: Request, res: Response) => {
  try {
    const { key, value, type, label, description, category } = req.body;
    const adminId = (req as any).user?.id;

    if (!key || !value || !label) {
      return res.status(400).json({
        success: false,
        message: 'Key, value, and label are required',
      });
    }

    // Check if setting already exists
    const existing = await prisma.systemSetting.findUnique({
      where: { key },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists',
      });
    }

    // Create setting
    const setting = await prisma.systemSetting.create({
      data: {
        key,
        value: String(value),
        type: type || 'STRING',
        label,
        description,
        category: category || 'GENERAL',
        updatedBy: adminId,
      },
    });

    res.status(201).json({
      success: true,
      data: setting,
      message: 'Setting created successfully',
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create setting',
    });
  }
};

/**
 * Delete a system setting (Admin only)
 */
export const deleteSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    await prisma.systemSetting.delete({
      where: { key },
    });

    res.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete setting',
    });
  }
};
