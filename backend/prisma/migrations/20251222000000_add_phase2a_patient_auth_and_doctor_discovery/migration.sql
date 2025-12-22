-- Add Phase 2A fields to Doctor table
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "doctorType" TEXT NOT NULL DEFAULT 'ALLOPATHY';
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "subspecialty" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "languagesSpoken" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "consultationFee" INTEGER;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP(3);
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "availability" JSONB;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "totalReviews" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "averageRating" DECIMAL(3,2) DEFAULT 0;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "appointmentBuffer" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "referralCredits" INTEGER NOT NULL DEFAULT 0;

-- Add Phase 2A fields to Patient table
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "lastOtpSent" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "otpAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "otpLockedUntil" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN IF NOT EXISTS "accountType" TEXT NOT NULL DEFAULT 'LINK_BASED';

-- Make Patient.doctorId nullable for self-registered patients
ALTER TABLE "Patient" ALTER COLUMN "doctorId" DROP NOT NULL;

-- Create PatientOtp table
CREATE TABLE IF NOT EXISTS "PatientOtp" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientOtp_pkey" PRIMARY KEY ("id")
);

-- Create index on PatientOtp.phone for faster lookups
CREATE INDEX IF NOT EXISTS "PatientOtp_phone_idx" ON "PatientOtp"("phone");

-- Create Appointment table (Phase 2B - ready for future use)
CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "consultationId" TEXT,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "consultationType" TEXT NOT NULL DEFAULT 'VIDEO',
    "notes" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Appointment
CREATE INDEX IF NOT EXISTS "Appointment_doctorId_scheduledTime_idx" ON "Appointment"("doctorId", "scheduledTime");
CREATE INDEX IF NOT EXISTS "Appointment_patientId_scheduledTime_idx" ON "Appointment"("patientId", "scheduledTime");
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_consultationId_key" ON "Appointment"("consultationId");

-- Create MedicineReminder table (Phase 2B - ready for future use)
CREATE TABLE IF NOT EXISTS "MedicineReminder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "customSchedule" JSONB,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineReminder_pkey" PRIMARY KEY ("id")
);

-- Create index for MedicineReminder
CREATE INDEX IF NOT EXISTS "MedicineReminder_patientId_isActive_idx" ON "MedicineReminder"("patientId", "isActive");

-- Create MedicineAdherenceLog table (Phase 2B - ready for future use)
CREATE TABLE IF NOT EXISTS "MedicineAdherenceLog" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicineAdherenceLog_pkey" PRIMARY KEY ("id")
);

-- Create index for MedicineAdherenceLog
CREATE INDEX IF NOT EXISTS "MedicineAdherenceLog_reminderId_scheduledTime_idx" ON "MedicineAdherenceLog"("reminderId", "scheduledTime");

-- Create Referral table (Phase 2B - ready for future use)
CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "fromDoctorId" TEXT NOT NULL,
    "toDoctorId" TEXT,
    "patientId" TEXT NOT NULL,
    "consultationId" TEXT NOT NULL,
    "newConsultationId" TEXT,
    "specialty" TEXT,
    "reason" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "referralNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Referral
CREATE INDEX IF NOT EXISTS "Referral_fromDoctorId_idx" ON "Referral"("fromDoctorId");
CREATE INDEX IF NOT EXISTS "Referral_toDoctorId_idx" ON "Referral"("toDoctorId");
CREATE INDEX IF NOT EXISTS "Referral_patientId_idx" ON "Referral"("patientId");
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_newConsultationId_key" ON "Referral"("newConsultationId");

-- Create ReferralIncentive table (Phase 2B - ready for future use)
CREATE TABLE IF NOT EXISTS "ReferralIncentive" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "referringDoctorId" TEXT NOT NULL,
    "creditType" TEXT NOT NULL,
    "creditAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralIncentive_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ReferralIncentive
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralIncentive_referralId_key" ON "ReferralIncentive"("referralId");
CREATE INDEX IF NOT EXISTS "ReferralIncentive_referringDoctorId_status_idx" ON "ReferralIncentive"("referringDoctorId", "status");

-- Add foreign key constraints for new tables
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MedicineReminder" ADD CONSTRAINT "MedicineReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MedicineReminder" ADD CONSTRAINT "MedicineReminder_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MedicineAdherenceLog" ADD CONSTRAINT "MedicineAdherenceLog_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "MedicineReminder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Referral" ADD CONSTRAINT "Referral_fromDoctorId_fkey" FOREIGN KEY ("fromDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toDoctorId_fkey" FOREIGN KEY ("toDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_newConsultationId_fkey" FOREIGN KEY ("newConsultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ReferralIncentive" ADD CONSTRAINT "ReferralIncentive_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralIncentive" ADD CONSTRAINT "ReferralIncentive_referringDoctorId_fkey" FOREIGN KEY ("referringDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
