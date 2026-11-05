package com.example.data.model

import com.squareup.moshi.JsonClass
import java.util.UUID

@JsonClass(generateAdapter = true)
data class User(
    val id: String = UUID.randomUUID().toString(),
    val employeeId: String,
    val name: String,
    val email: String,
    val role: String = "EMPLOYEE",
    val phone: String = "+1 (555) 234-5678",
    val assignedSubAdmin: String = "Admin Sarah Jenkins",
    val status: String = "ACTIVE"
)

@JsonClass(generateAdapter = true)
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: User
)

@JsonClass(generateAdapter = true)
data class AttendanceRecord(
    val id: String = UUID.randomUUID().toString(),
    val employeeId: String,
    val checkInTime: String,
    val checkInLatitude: Double,
    val checkInLongitude: Double,
    val checkInAccuracy: Float,
    val checkOutTime: String? = null,
    val checkOutLatitude: Double? = null,
    val checkOutLongitude: Double? = null,
    val checkOutAccuracy: Float? = null,
    val durationMinutes: Long = 0,
    val status: String = "ACTIVE" // ACTIVE, COMPLETED
)

enum class EntryStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}

@JsonClass(generateAdapter = true)
data class DailyWorkEntry(
    val id: String = UUID.randomUUID().toString(),
    val employeeId: String,
    val websiteUrl: String,
    val bankAccountNumberMasked: String, // e.g. "•••• •••• 5849"
    val referenceId: String,
    val amount: Double,
    val withdrawalAmount: Double,
    val screenshotUrl: String = "",
    val status: EntryStatus = EntryStatus.PENDING,
    val adminRemarks: String? = null,
    val rejectionReason: String? = null,
    val createdAt: String,
    val updatedAt: String? = null
)

@JsonClass(generateAdapter = true)
data class FinancialSummary(
    val totalAllocated: Double,
    val approvedWithdrawals: Double,
    val pendingWithdrawals: Double,
    val availableBalance: Double
) {
    companion object {
        fun calculate(allocated: Double, approved: Double, pending: Double): FinancialSummary {
            val available = (allocated - approved - pending).coerceAtLeast(0.0)
            return FinancialSummary(
                totalAllocated = allocated,
                approvedWithdrawals = approved,
                pendingWithdrawals = pending,
                availableBalance = available
            )
        }
    }
}

enum class TransactionType {
    ALLOCATION_CREDIT,
    WITHDRAWAL_APPROVED,
    PENDING_RESERVATION,
    RESERVATION_RELEASED,
    ADJUSTMENT
}

@JsonClass(generateAdapter = true)
data class FinancialTransaction(
    val id: String = UUID.randomUUID().toString(),
    val employeeId: String,
    val referenceId: String,
    val type: TransactionType,
    val amount: Double,
    val status: String,
    val description: String,
    val timestamp: String
)

@JsonClass(generateAdapter = true)
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null,
    val errors: List<String>? = null
)
