-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinanceRequestType" AS ENUM ('EXPENSE', 'REIMBURSEMENT', 'ADVANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerTransactionStatus" AS ENUM ('POSTED', 'REVERSED');

-- CreateTable
CREATE TABLE "finance_accounts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "accountType" "FinanceAccountType" NOT NULL,
    "employeeId" UUID,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "LedgerTransactionStatus" NOT NULL DEFAULT 'POSTED',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "debitAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_requests" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "type" "FinanceRequestType" NOT NULL,
    "status" "FinanceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "description" TEXT NOT NULL,
    "reason" TEXT,
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "ledgerTransactionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_accounts_code_key" ON "finance_accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "finance_accounts_employeeId_key" ON "finance_accounts"("employeeId");

-- CreateIndex
CREATE INDEX "finance_accounts_accountType_isActive_idx" ON "finance_accounts"("accountType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_transactions_reference_key" ON "ledger_transactions"("reference");

-- CreateIndex
CREATE INDEX "ledger_transactions_postedAt_idx" ON "ledger_transactions"("postedAt");

-- CreateIndex
CREATE INDEX "ledger_transactions_status_postedAt_idx" ON "ledger_transactions"("status", "postedAt");

-- CreateIndex
CREATE INDEX "ledger_entries_accountId_createdAt_idx" ON "ledger_entries"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "ledger_entries_transactionId_idx" ON "ledger_entries"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_requests_ledgerTransactionId_key" ON "finance_requests"("ledgerTransactionId");

-- CreateIndex
CREATE INDEX "finance_requests_employeeId_status_idx" ON "finance_requests"("employeeId", "status");

-- CreateIndex
CREATE INDEX "finance_requests_reviewedById_idx" ON "finance_requests"("reviewedById");

-- CreateIndex
CREATE INDEX "finance_requests_createdAt_idx" ON "finance_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "finance_accounts" ADD CONSTRAINT "finance_accounts_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ledger_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_requests" ADD CONSTRAINT "finance_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_requests" ADD CONSTRAINT "finance_requests_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_requests" ADD CONSTRAINT "finance_requests_ledgerTransactionId_fkey" FOREIGN KEY ("ledgerTransactionId") REFERENCES "ledger_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
