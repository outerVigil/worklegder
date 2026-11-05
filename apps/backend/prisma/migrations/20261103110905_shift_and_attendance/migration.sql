-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('OPEN', 'COMPLETED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('MISSING_CHECK_IN', 'MISSING_CHECK_OUT', 'CORRECT_CHECK_IN', 'CORRECT_CHECK_OUT', 'CORRECT_BOTH');

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "gracePeriod" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shift_assignments" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "shiftId" UUID NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'OPEN',
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "checkInLatitude" DECIMAL(10,7),
    "checkInLongitude" DECIMAL(10,7),
    "checkOutLatitude" DECIMAL(10,7),
    "checkOutLongitude" DECIMAL(10,7),
    "checkInAccuracy" DECIMAL(8,2),
    "checkOutAccuracy" DECIMAL(8,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_adjustments" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "sessionId" UUID,
    "type" "AdjustmentType" NOT NULL,
    "status" "AdjustmentStatus" NOT NULL DEFAULT 'PENDING',
    "proposedCheckInAt" TIMESTAMP(3),
    "proposedCheckOutAt" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employee_shift_assignments_employeeId_effectiveFrom_effecti_idx" ON "employee_shift_assignments"("employeeId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "employee_shift_assignments_shiftId_idx" ON "employee_shift_assignments"("shiftId");

-- CreateIndex
CREATE INDEX "attendance_sessions_employeeId_checkInAt_idx" ON "attendance_sessions"("employeeId", "checkInAt");

-- CreateIndex
CREATE INDEX "attendance_sessions_employeeId_status_idx" ON "attendance_sessions"("employeeId", "status");

-- CreateIndex
CREATE INDEX "attendance_adjustments_employeeId_status_idx" ON "attendance_adjustments"("employeeId", "status");

-- CreateIndex
CREATE INDEX "attendance_adjustments_reviewedById_idx" ON "attendance_adjustments"("reviewedById");

-- AddForeignKey
ALTER TABLE "employee_shift_assignments" ADD CONSTRAINT "employee_shift_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shift_assignments" ADD CONSTRAINT "employee_shift_assignments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_adjustments" ADD CONSTRAINT "attendance_adjustments_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
