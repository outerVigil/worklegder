package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "attendance_records")
data class AttendanceEntity(
    @PrimaryKey val id: String,
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
    val status: String
)

@Entity(tableName = "work_entries")
data class EntryEntity(
    @PrimaryKey val id: String,
    val employeeId: String,
    val websiteUrl: String,
    val bankAccountNumberMasked: String,
    val referenceId: String,
    val amount: Double,
    val withdrawalAmount: Double,
    val screenshotUrl: String,
    val status: String,
    val adminRemarks: String?,
    val rejectionReason: String?,
    val createdAt: String
)

@Entity(tableName = "financial_transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val employeeId: String,
    val referenceId: String,
    val type: String,
    val amount: Double,
    val status: String,
    val description: String,
    val timestamp: String
)

@Entity(tableName = "employee_allocations")
data class AllocationEntity(
    @PrimaryKey val id: String,
    val employeeId: String,
    val amount: Double,
    val allocatedAt: String,
    val notes: String
)
