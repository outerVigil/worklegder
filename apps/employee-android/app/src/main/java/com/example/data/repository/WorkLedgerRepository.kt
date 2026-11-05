package com.example.data.repository

import com.example.data.local.AllocationEntity
import com.example.data.local.AppDatabase
import com.example.data.local.AttendanceEntity
import com.example.data.local.EntryEntity
import com.example.data.local.TokenStorage
import com.example.data.local.TransactionEntity
import com.example.data.model.AttendanceRecord
import com.example.data.model.DailyWorkEntry
import com.example.data.model.EntryStatus
import com.example.data.model.FinancialSummary
import com.example.data.model.FinancialTransaction
import com.example.data.model.TransactionType
import com.example.data.model.User
import com.example.data.remote.ApiClient
import com.example.data.remote.CheckInRequest
import com.example.data.remote.CheckOutRequest
import com.example.data.remote.CreateEntryRequest
import com.example.data.remote.LoginRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.UUID

class WorkLedgerRepository(
    private val database: AppDatabase,
    private val tokenStorage: TokenStorage,
    private val apiClient: ApiClient
) {
    private val dao = database.dao()

    private fun getCurrentIsoTimestamp(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        return sdf.format(Date())
    }

    // --- Authentication ---
    suspend fun login(identifier: String, pass: String): Result<User> = withContext(Dispatchers.IO) {
        // Attempt network call first
        try {
            val response = apiClient.createService().login(LoginRequest(identifier, pass))
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()?.data
                if (data != null) {
                    tokenStorage.saveTokens(data.accessToken, data.refreshToken)
                    tokenStorage.saveUser(data.user)
                    return@withContext Result.success(data.user)
                }
            }
        } catch (_: Exception) {
            // Network fallback: offline/standalone demo mode
        }

        // Offline / Standalone authentication logic
        if (identifier.isNotBlank() && pass.length >= 4) {
            val user = when {
                identifier.contains("sarah", ignoreCase = true) || identifier.contains("102") -> {
                    User(
                        id = "emp-usr-102",
                        employeeId = "EMP-1083",
                        name = "Sarah Connor",
                        email = "sarah.connor@company.com",
                        role = "EMPLOYEE",
                        phone = "+1 (555) 345-6789",
                        assignedSubAdmin = "Admin David Miller",
                        status = "ACTIVE"
                    )
                }
                else -> {
                    User(
                        id = "emp-usr-101",
                        employeeId = "EMP-1082",
                        name = "John Doe",
                        email = if (identifier.contains("@")) identifier else "john.doe@company.com",
                        role = "EMPLOYEE",
                        phone = "+1 (555) 234-5678",
                        assignedSubAdmin = "Admin Sarah Jenkins",
                        status = "ACTIVE"
                    )
                }
            }
            tokenStorage.saveTokens("jwt_demo_access_token_${UUID.randomUUID()}", "jwt_demo_refresh_token")
            tokenStorage.saveUser(user)
            seedInitialDataIfEmpty(user.employeeId)
            return@withContext Result.success(user)
        } else {
            return@withContext Result.failure(Exception("Invalid credentials. Password must be at least 4 characters."))
        }
    }

    fun logout() {
        tokenStorage.clearSession()
    }

    fun getCurrentUser(): User? = tokenStorage.getUser()

    fun isLoggedIn(): Boolean = tokenStorage.isLoggedIn()

    // --- Seed Initial Data ---
    suspend fun seedInitialDataIfEmpty(employeeId: String) = withContext(Dispatchers.IO) {
        val active = dao.getActiveAttendance(employeeId)
        val sampleEntry = dao.getEntryById("sample-entry-1")

        if (sampleEntry == null) {
            // Seed allocation
            dao.insertAllocation(
                AllocationEntity(
                    id = "alloc-1",
                    employeeId = employeeId,
                    amount = 12500.0,
                    allocatedAt = "2026-10-25T09:00:00Z",
                    notes = "Q4 Operational Expense Allocation"
                )
            )

            // Seed approved entry
            dao.insertEntry(
                EntryEntity(
                    id = "sample-entry-1",
                    employeeId = employeeId,
                    websiteUrl = "https://client-portal.fintechcorp.io/campaign/77",
                    bankAccountNumberMasked = "•••• •••• 4892",
                    referenceId = "REF-2026-9041",
                    amount = 5200.0,
                    withdrawalAmount = 5200.0,
                    screenshotUrl = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500",
                    status = "APPROVED",
                    adminRemarks = "Verified against merchant gateway settlement.",
                    rejectionReason = null,
                    createdAt = "2026-10-28T14:30:00Z"
                )
            )

            // Seed pending entry
            dao.insertEntry(
                EntryEntity(
                    id = "sample-entry-2",
                    employeeId = employeeId,
                    websiteUrl = "https://digitalads-tracker.network/reports/oct",
                    bankAccountNumberMasked = "•••• •••• 4892",
                    referenceId = "REF-2026-9099",
                    amount = 850.0,
                    withdrawalAmount = 850.0,
                    screenshotUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
                    status = "PENDING",
                    adminRemarks = null,
                    rejectionReason = null,
                    createdAt = "2026-11-01T11:15:00Z"
                )
            )

            // Seed financial ledger transactions
            dao.insertTransaction(
                TransactionEntity(
                    id = "tx-1",
                    employeeId = employeeId,
                    referenceId = "ALLOC-Q4-INIT",
                    type = TransactionType.ALLOCATION_CREDIT.name,
                    amount = 12500.0,
                    status = "SETTLED",
                    description = "Initial Q4 Company Working Capital Allocation",
                    timestamp = "2026-10-25T09:00:00Z"
                )
            )

            dao.insertTransaction(
                TransactionEntity(
                    id = "tx-2",
                    employeeId = employeeId,
                    referenceId = "REF-2026-9041",
                    type = TransactionType.WITHDRAWAL_APPROVED.name,
                    amount = 5200.0,
                    status = "SETTLED",
                    description = "Approved withdrawal for Client Campaign 77",
                    timestamp = "2026-10-28T15:00:00Z"
                )
            )

            dao.insertTransaction(
                TransactionEntity(
                    id = "tx-3",
                    employeeId = employeeId,
                    referenceId = "REF-2026-9099",
                    type = TransactionType.PENDING_RESERVATION.name,
                    amount = 850.0,
                    status = "RESERVED",
                    description = "Funds reserved for pending entry REF-2026-9099",
                    timestamp = "2026-11-01T11:15:00Z"
                )
            )

            // Seed attendance record
            dao.insertAttendance(
                AttendanceEntity(
                    id = "att-yesterday",
                    employeeId = employeeId,
                    checkInTime = "2026-11-01T08:58:12Z",
                    checkInLatitude = 37.7749,
                    checkInLongitude = -122.4194,
                    checkInAccuracy = 5.2f,
                    checkOutTime = "2026-11-01T17:35:45Z",
                    checkOutLatitude = 37.7751,
                    checkOutLongitude = -122.4190,
                    checkOutAccuracy = 6.1f,
                    durationMinutes = 517,
                    status = "COMPLETED"
                )
            )
        }
    }

    // --- Financial Ledger Calculations ---
    fun getFinancialSummary(employeeId: String): Flow<FinancialSummary> {
        return combine(
            dao.getTotalAllocated(employeeId),
            dao.getApprovedWithdrawalsSum(employeeId),
            dao.getPendingWithdrawalsSum(employeeId)
        ) { allocated, approved, pending ->
            val alloc = allocated ?: 0.0
            val appr = approved ?: 0.0
            val pend = pending ?: 0.0
            FinancialSummary.calculate(alloc, appr, pend)
        }.flowOn(Dispatchers.IO)
    }

    fun getTransactions(employeeId: String): Flow<List<FinancialTransaction>> {
        return dao.getTransactions(employeeId).map { list ->
            list.map { entity ->
                FinancialTransaction(
                    id = entity.id,
                    employeeId = entity.employeeId,
                    referenceId = entity.referenceId,
                    type = try { TransactionType.valueOf(entity.type) } catch (_: Exception) { TransactionType.ADJUSTMENT },
                    amount = entity.amount,
                    status = entity.status,
                    description = entity.description,
                    timestamp = entity.timestamp
                )
            }
        }.flowOn(Dispatchers.IO)
    }

    // --- Attendance Operations ---
    suspend fun getActiveAttendance(employeeId: String): AttendanceRecord? = withContext(Dispatchers.IO) {
        val entity = dao.getActiveAttendance(employeeId) ?: return@withContext null
        AttendanceRecord(
            id = entity.id,
            employeeId = entity.employeeId,
            checkInTime = entity.checkInTime,
            checkInLatitude = entity.checkInLatitude,
            checkInLongitude = entity.checkInLongitude,
            checkInAccuracy = entity.checkInAccuracy,
            checkOutTime = entity.checkOutTime,
            checkOutLatitude = entity.checkOutLatitude,
            checkOutLongitude = entity.checkOutLongitude,
            checkOutAccuracy = entity.checkOutAccuracy,
            durationMinutes = entity.durationMinutes,
            status = entity.status
        )
    }

    fun getAttendanceHistory(employeeId: String): Flow<List<AttendanceRecord>> {
        return dao.getAttendanceHistory(employeeId).map { list ->
            list.map { entity ->
                AttendanceRecord(
                    id = entity.id,
                    employeeId = entity.employeeId,
                    checkInTime = entity.checkInTime,
                    checkInLatitude = entity.checkInLatitude,
                    checkInLongitude = entity.checkInLongitude,
                    checkInAccuracy = entity.checkInAccuracy,
                    checkOutTime = entity.checkOutTime,
                    checkOutLatitude = entity.checkOutLatitude,
                    checkOutLongitude = entity.checkOutLongitude,
                    checkOutAccuracy = entity.checkOutAccuracy,
                    durationMinutes = entity.durationMinutes,
                    status = entity.status
                )
            }
        }.flowOn(Dispatchers.IO)
    }

    suspend fun checkIn(
        employeeId: String,
        latitude: Double,
        longitude: Double,
        accuracy: Float
    ): Result<AttendanceRecord> = withContext(Dispatchers.IO) {
        // Enforce: Prevent multiple open attendance sessions
        val existing = dao.getActiveAttendance(employeeId)
        if (existing != null) {
            return@withContext Result.failure(Exception("You already have an active check-in session in progress."))
        }

        // Try remote check-in
        try {
            val response = apiClient.createService().checkIn(
                CheckInRequest(
                    latitude = latitude,
                    longitude = longitude,
                    accuracy = accuracy,
                    deviceTimestamp = getCurrentIsoTimestamp()
                )
            )
            if (response.isSuccessful && response.body()?.data != null) {
                val record = response.body()!!.data!!
                dao.insertAttendance(
                    AttendanceEntity(
                        id = record.id,
                        employeeId = employeeId,
                        checkInTime = record.checkInTime,
                        checkInLatitude = record.checkInLatitude,
                        checkInLongitude = record.checkInLongitude,
                        checkInAccuracy = record.checkInAccuracy,
                        status = "ACTIVE"
                    )
                )
                return@withContext Result.success(record)
            }
        } catch (_: Exception) {
            // Local fallback
        }

        val timestamp = getCurrentIsoTimestamp()
        val recordId = UUID.randomUUID().toString()
        val entity = AttendanceEntity(
            id = recordId,
            employeeId = employeeId,
            checkInTime = timestamp,
            checkInLatitude = latitude,
            checkInLongitude = longitude,
            checkInAccuracy = accuracy,
            status = "ACTIVE"
        )
        dao.insertAttendance(entity)

        Result.success(
            AttendanceRecord(
                id = recordId,
                employeeId = employeeId,
                checkInTime = timestamp,
                checkInLatitude = latitude,
                checkInLongitude = longitude,
                checkInAccuracy = accuracy,
                status = "ACTIVE"
            )
        )
    }

    suspend fun checkOut(
        employeeId: String,
        latitude: Double,
        longitude: Double,
        accuracy: Float,
        remarks: String? = null
    ): Result<AttendanceRecord> = withContext(Dispatchers.IO) {
        val existing = dao.getActiveAttendance(employeeId)
            ?: return@withContext Result.failure(Exception("No active attendance session found to check out from."))

        val checkOutTime = getCurrentIsoTimestamp()

        // Calculate duration in minutes (handles crossing midnight)
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val inDate = try { sdf.parse(existing.checkInTime) } catch (_: Exception) { null }
        val outDate = try { sdf.parse(checkOutTime) } catch (_: Exception) { null }
        val duration = if (inDate != null && outDate != null) {
            ((outDate.time - inDate.time) / (1000 * 60)).coerceAtLeast(1)
        } else {
            60
        }

        // Try remote checkout
        try {
            val response = apiClient.createService().checkOut(
                CheckOutRequest(
                    latitude = latitude,
                    longitude = longitude,
                    accuracy = accuracy,
                    deviceTimestamp = checkOutTime,
                    remarks = remarks
                )
            )
            if (response.isSuccessful && response.body()?.data != null) {
                val record = response.body()!!.data!!
                dao.updateAttendance(
                    existing.copy(
                        checkOutTime = record.checkOutTime ?: checkOutTime,
                        checkOutLatitude = latitude,
                        checkOutLongitude = longitude,
                        checkOutAccuracy = accuracy,
                        durationMinutes = record.durationMinutes,
                        status = "COMPLETED"
                    )
                )
                return@withContext Result.success(record)
            }
        } catch (_: Exception) {
            // Local fallback
        }

        val updated = existing.copy(
            checkOutTime = checkOutTime,
            checkOutLatitude = latitude,
            checkOutLongitude = longitude,
            checkOutAccuracy = accuracy,
            durationMinutes = duration,
            status = "COMPLETED"
        )
        dao.updateAttendance(updated)

        Result.success(
            AttendanceRecord(
                id = updated.id,
                employeeId = employeeId,
                checkInTime = updated.checkInTime,
                checkInLatitude = updated.checkInLatitude,
                checkInLongitude = updated.checkInLongitude,
                checkInAccuracy = updated.checkInAccuracy,
                checkOutTime = updated.checkOutTime,
                checkOutLatitude = updated.checkOutLatitude,
                checkOutLongitude = updated.checkOutLongitude,
                checkOutAccuracy = updated.checkOutAccuracy,
                durationMinutes = updated.durationMinutes,
                status = "COMPLETED"
            )
        )
    }

    // --- Work Entries & Financial Transactions ---
    fun getEntries(employeeId: String): Flow<List<DailyWorkEntry>> {
        return dao.getEntries(employeeId).map { list ->
            list.map { entity ->
                DailyWorkEntry(
                    id = entity.id,
                    employeeId = entity.employeeId,
                    websiteUrl = entity.websiteUrl,
                    bankAccountNumberMasked = entity.bankAccountNumberMasked,
                    referenceId = entity.referenceId,
                    amount = entity.amount,
                    withdrawalAmount = entity.withdrawalAmount,
                    screenshotUrl = entity.screenshotUrl,
                    status = try { EntryStatus.valueOf(entity.status) } catch (_: Exception) { EntryStatus.PENDING },
                    adminRemarks = entity.adminRemarks,
                    rejectionReason = entity.rejectionReason,
                    createdAt = entity.createdAt
                )
            }
        }.flowOn(Dispatchers.IO)
    }

    suspend fun submitEntry(
        employeeId: String,
        websiteUrl: String,
        bankAccountNumber: String,
        referenceId: String,
        amount: Double,
        withdrawalAmount: Double,
        screenshotDataUrl: String
    ): Result<DailyWorkEntry> = withContext(Dispatchers.IO) {
        // Validation: Required fields
        if (websiteUrl.isBlank() || !websiteUrl.contains(".")) {
            return@withContext Result.failure(Exception("Please enter a valid website URL or domain."))
        }
        if (bankAccountNumber.isBlank() || bankAccountNumber.length < 6) {
            return@withContext Result.failure(Exception("Bank account number must be at least 6 digits."))
        }
        if (referenceId.isBlank()) {
            return@withContext Result.failure(Exception("Reference ID is mandatory."))
        }
        if (amount <= 0) {
            return@withContext Result.failure(Exception("Entry amount must be greater than zero."))
        }
        if (withdrawalAmount < 0) {
            return@withContext Result.failure(Exception("Withdrawal amount cannot be negative."))
        }

        // Ledger check: Cannot exceed available balance
        val totalAllocated = dao.getTotalAllocated(employeeId)
        // Query current balance synchronously from DB
        val alloc = (database.openHelper.readableDatabase.let { db ->
            val cursor = db.query("SELECT SUM(amount) FROM employee_allocations WHERE employeeId = '$employeeId'")
            if (cursor.moveToFirst()) cursor.getDouble(0) else 0.0
        })
        val approved = (database.openHelper.readableDatabase.let { db ->
            val cursor = db.query("SELECT SUM(withdrawalAmount) FROM work_entries WHERE employeeId = '$employeeId' AND status = 'APPROVED'")
            if (cursor.moveToFirst()) cursor.getDouble(0) else 0.0
        })
        val pending = (database.openHelper.readableDatabase.let { db ->
            val cursor = db.query("SELECT SUM(withdrawalAmount) FROM work_entries WHERE employeeId = '$employeeId' AND status = 'PENDING'")
            if (cursor.moveToFirst()) cursor.getDouble(0) else 0.0
        })
        val available = (alloc - approved - pending).coerceAtLeast(0.0)

        if (withdrawalAmount > available) {
            return@withContext Result.failure(
                Exception("Requested withdrawal ($$withdrawalAmount) exceeds current available balance ($${String.format(Locale.US, "%.2f", available)}).")
            )
        }

        val maskedBank = if (bankAccountNumber.length > 4) {
            "•••• •••• " + bankAccountNumber.takeLast(4)
        } else {
            "•••• $bankAccountNumber"
        }

        val entryId = UUID.randomUUID().toString()
        val timestamp = getCurrentIsoTimestamp()

        // Try remote submission
        try {
            val response = apiClient.createService().submitEntry(
                CreateEntryRequest(
                    websiteUrl = websiteUrl,
                    bankAccountNumber = bankAccountNumber,
                    referenceId = referenceId,
                    amount = amount,
                    withdrawalAmount = withdrawalAmount,
                    screenshotDataUrl = screenshotDataUrl
                )
            )
            if (response.isSuccessful && response.body()?.data != null) {
                val data = response.body()!!.data!!
                dao.insertEntry(
                    EntryEntity(
                        id = data.id,
                        employeeId = employeeId,
                        websiteUrl = data.websiteUrl,
                        bankAccountNumberMasked = data.bankAccountNumberMasked,
                        referenceId = data.referenceId,
                        amount = data.amount,
                        withdrawalAmount = data.withdrawalAmount,
                        screenshotUrl = data.screenshotUrl,
                        status = data.status.name,
                        adminRemarks = data.adminRemarks,
                        rejectionReason = data.rejectionReason,
                        createdAt = data.createdAt
                    )
                )
                return@withContext Result.success(data)
            }
        } catch (_: Exception) {
            // Local fallback
        }

        // Local SQLite Transaction & Ledger Reservation
        val entryEntity = EntryEntity(
            id = entryId,
            employeeId = employeeId,
            websiteUrl = websiteUrl,
            bankAccountNumberMasked = maskedBank,
            referenceId = referenceId,
            amount = amount,
            withdrawalAmount = withdrawalAmount,
            screenshotUrl = screenshotDataUrl,
            status = EntryStatus.PENDING.name,
            adminRemarks = null,
            rejectionReason = null,
            createdAt = timestamp
        )
        dao.insertEntry(entryEntity)

        // Ledger: Record Pending Reservation
        if (withdrawalAmount > 0) {
            dao.insertTransaction(
                TransactionEntity(
                    id = "res-${UUID.randomUUID()}",
                    employeeId = employeeId,
                    referenceId = referenceId,
                    type = TransactionType.PENDING_RESERVATION.name,
                    amount = withdrawalAmount,
                    status = "RESERVED",
                    description = "Funds reserved for pending withdrawal request #$referenceId",
                    timestamp = timestamp
                )
            )
        }

        Result.success(
            DailyWorkEntry(
                id = entryId,
                employeeId = employeeId,
                websiteUrl = websiteUrl,
                bankAccountNumberMasked = maskedBank,
                referenceId = referenceId,
                amount = amount,
                withdrawalAmount = withdrawalAmount,
                screenshotUrl = screenshotDataUrl,
                status = EntryStatus.PENDING,
                adminRemarks = null,
                rejectionReason = null,
                createdAt = timestamp
            )
        )
    }

    suspend fun cancelEntry(entryId: String, employeeId: String): Result<Unit> = withContext(Dispatchers.IO) {
        val entry = dao.getEntryById(entryId)
            ?: return@withContext Result.failure(Exception("Entry not found."))

        if (entry.status != "PENDING") {
            return@withContext Result.failure(Exception("Only PENDING entries can be cancelled."))
        }

        // Try remote cancellation
        try {
            apiClient.createService().cancelEntry(entryId)
        } catch (_: Exception) {
            // Local fallback
        }

        dao.cancelEntry(entryId)

        // If funds were reserved, record a ledger release
        if (entry.withdrawalAmount > 0) {
            dao.insertTransaction(
                TransactionEntity(
                    id = "rel-${UUID.randomUUID()}",
                    employeeId = employeeId,
                    referenceId = entry.referenceId,
                    type = TransactionType.RESERVATION_RELEASED.name,
                    amount = entry.withdrawalAmount,
                    status = "RELEASED",
                    description = "Reservation released upon cancellation of entry #${entry.referenceId}",
                    timestamp = getCurrentIsoTimestamp()
                )
            )
        }

        Result.success(Unit)
    }
}
