-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "registrationType" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "registrationState" TEXT,
    "aadhaarNumber" TEXT NOT NULL,
    "registrationCertificate" TEXT,
    "aadhaarFrontPhoto" TEXT,
    "aadhaarBackPhoto" TEXT,
    "profilePhoto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "rejectionReason" TEXT,
    "upiId" TEXT,
    "qrCodeImage" TEXT,
    "trialStartDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" DATETIME NOT NULL,
    "patientsCreated" INTEGER NOT NULL DEFAULT 0,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "subscriptionEndsAt" DATETIME,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'TRIAL',
    "patientLimit" INTEGER NOT NULL DEFAULT 2,
    "monthlyVideoMinutes" INTEGER NOT NULL DEFAULT 100,
    "purchasedMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalMinutesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "razorpaySubscriptionId" TEXT,
    "razorpayCustomerId" TEXT,
    "lastPrescriptionSerial" INTEGER NOT NULL DEFAULT 0,
    "allowSelfRegistration" BOOLEAN NOT NULL DEFAULT true,
    "currentSubscriptionHistoryId" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "chatNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "accessToken" TEXT NOT NULL,
    "createdVia" TEXT NOT NULL DEFAULT 'MANUAL',
    "videoCallEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER DEFAULT 0,
    "videoDuration" INTEGER DEFAULT 0,
    "wentOvertime" BOOLEAN NOT NULL DEFAULT false,
    "overtimeMinutes" INTEGER DEFAULT 0,
    "agoraChannelName" TEXT,
    "agoraDoctorToken" TEXT,
    "agoraPatientToken" TEXT,
    "chiefComplaint" TEXT,
    "doctorNotes" TEXT,
    "lastMessageAt" DATETIME,
    "lastMessageSender" TEXT,
    "hasUnreadMessages" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachmentPath" TEXT,
    "attachmentType" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "weight" REAL,
    "height" REAL,
    "bloodPressure" TEXT,
    "temperature" REAL,
    "heartRate" INTEGER,
    "oxygenLevel" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vitals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicalUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicalUpload_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "medications" TEXT NOT NULL,
    "instructions" TEXT,
    "pdfPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentConfirmation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "confirmedByDoctor" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" DATETIME,
    "proofImagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentConfirmation_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MinutePurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MinutePurchase_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultationReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsultationReview_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "patientLimit" INTEGER NOT NULL,
    "monthlyVideoMinutes" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "suggestedFor" TEXT,
    "avgConsultationTime" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastModifiedBy" TEXT,
    "modificationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "genericName" TEXT,
    "manufacturer" TEXT,
    "dosageForms" TEXT,
    "commonStrengths" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "restrictionNotes" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DoctorMedicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "personalNotes" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorMedicine_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoctorMedicine_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoctorSubscriptionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doctorId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "pricePaid" INTEGER NOT NULL,
    "patientLimit" INTEGER NOT NULL,
    "monthlyVideoMinutes" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DoctorSubscriptionHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DoctorSubscriptionHistory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientType" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "actionText" TEXT,
    "metadata" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_razorpaySubscriptionId_key" ON "Doctor"("razorpaySubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_razorpayCustomerId_key" ON "Doctor"("razorpayCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_currentSubscriptionHistoryId_key" ON "Doctor"("currentSubscriptionHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_accessToken_key" ON "Patient"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_agoraChannelName_key" ON "Consultation"("agoraChannelName");

-- CreateIndex
CREATE INDEX "ChatMessage_consultationId_createdAt_idx" ON "ChatMessage"("consultationId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_consultationId_isRead_idx" ON "ChatMessage"("consultationId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_consultationId_key" ON "Prescription"("consultationId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_createdAt_idx" ON "Prescription"("doctorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_doctorId_serialNumber_key" ON "Prescription"("doctorId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfirmation_consultationId_key" ON "PaymentConfirmation"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "MinutePurchase_razorpayOrderId_key" ON "MinutePurchase"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "MinutePurchase_razorpayPaymentId_key" ON "MinutePurchase"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationReview_consultationId_key" ON "ConsultationReview"("consultationId");

-- CreateIndex
CREATE INDEX "ConsultationReview_consultationId_idx" ON "ConsultationReview"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_tier_key" ON "SubscriptionPlan"("tier");

-- CreateIndex
CREATE INDEX "Medicine_category_isVerified_isBanned_idx" ON "Medicine"("category", "isVerified", "isBanned");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_category_key" ON "Medicine"("name", "category");

-- CreateIndex
CREATE INDEX "DoctorMedicine_doctorId_usageCount_idx" ON "DoctorMedicine"("doctorId", "usageCount");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorMedicine_doctorId_medicineId_key" ON "DoctorMedicine"("doctorId", "medicineId");

-- CreateIndex
CREATE INDEX "DoctorSubscriptionHistory_doctorId_status_idx" ON "DoctorSubscriptionHistory"("doctorId", "status");

-- CreateIndex
CREATE INDEX "DoctorSubscriptionHistory_endsAt_idx" ON "DoctorSubscriptionHistory"("endsAt");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_isRead_idx" ON "Notification"("recipientType", "recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_createdAt_idx" ON "Notification"("recipientType", "recipientId", "createdAt");
