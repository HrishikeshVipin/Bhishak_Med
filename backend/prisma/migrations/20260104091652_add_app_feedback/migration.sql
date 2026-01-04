-- CreateTable
CREATE TABLE "AppFeedback" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rating" INTEGER,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminResponse" TEXT,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AppFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppFeedback_doctorId_createdAt_idx" ON "AppFeedback"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "AppFeedback_type_status_idx" ON "AppFeedback"("type", "status");

-- CreateIndex
CREATE INDEX "AppFeedback_status_createdAt_idx" ON "AppFeedback"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AppFeedback_priority_status_idx" ON "AppFeedback"("priority", "status");

-- AddForeignKey
ALTER TABLE "AppFeedback" ADD CONSTRAINT "AppFeedback_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
