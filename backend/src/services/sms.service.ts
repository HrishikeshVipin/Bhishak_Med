import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = twilio(accountSid, authToken);

// Rate limiting: max 3 OTPs per hour per phone
const OTP_RATE_LIMIT = 3;
const OTP_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes lock after too many attempts

// Generate 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Twilio SMS
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; lockedUntil?: Date }> {
  try {
    // Check if phone is locked due to too many attempts
    const recentOtps = await prisma.patientOtp.findMany({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - OTP_RATE_WINDOW_MS),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if locked
    if (recentOtps.length > 0 && recentOtps[0].attempts >= 5) {
      const lockedUntil = new Date(recentOtps[0].createdAt.getTime() + OTP_LOCK_DURATION_MS);
      if (lockedUntil > new Date()) {
        return {
          success: false,
          message: `Too many attempts. Please try again after ${lockedUntil.toLocaleTimeString()}`,
          lockedUntil,
        };
      }
    }

    // Check rate limit
    if (recentOtps.length >= OTP_RATE_LIMIT) {
      return {
        success: false,
        message: `Maximum ${OTP_RATE_LIMIT} OTP requests per hour. Please try again later.`,
      };
    }

    // Generate and hash OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP to database
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    await prisma.patientOtp.create({
      data: {
        phone,
        otp: hashedOtp,
        expiresAt,
        verified: false,
        attempts: 0,
      },
    });

    // Send SMS via Twilio
    if (process.env.NODE_ENV === 'production') {
      await twilioClient.messages.create({
        body: `Your Bhishak Med OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`,
        from: fromNumber,
        to: phone.startsWith('+') ? phone : `+91${phone}`, // Add country code if not present
      });
    } else {
      // Development mode: log OTP to console
      console.log(`📱 OTP for ${phone}: ${otp} (dev mode - not sent via SMS)`);
    }

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP',
    };
  }
}

// Verify OTP
export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find most recent non-expired OTP for this phone
    const otpRecord = await prisma.patientOtp.findFirst({
      where: {
        phone,
        expiresAt: {
          gte: new Date(),
        },
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.',
      };
    }

    // Check if too many verification attempts
    if (otpRecord.attempts >= 5) {
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempt counter
      await prisma.patientOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      return {
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts - 1} attempts remaining.`,
      };
    }

    // Mark OTP as verified
    await prisma.patientOtp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify OTP',
    };
  }
}

// Clean up expired OTPs (run as cron job)
export async function cleanupExpiredOtps(): Promise<void> {
  try {
    const deleted = await prisma.patientOtp.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Older than 24 hours
        ],
      },
    });
    console.log(`🧹 Cleaned up ${deleted.count} expired OTP records`);
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
}
