package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkLedgerDao {

    // Attendance
    @Query("SELECT * FROM attendance_records WHERE employeeId = :empId ORDER BY checkInTime DESC")
    fun getAttendanceHistory(empId: String): Flow<List<AttendanceEntity>>

    @Query("SELECT * FROM attendance_records WHERE employeeId = :empId AND status = 'ACTIVE' LIMIT 1")
    suspend fun getActiveAttendance(empId: String): AttendanceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendance(attendance: AttendanceEntity)

    @Update
    suspend fun updateAttendance(attendance: AttendanceEntity)

    // Entries
    @Query("SELECT * FROM work_entries WHERE employeeId = :empId ORDER BY createdAt DESC")
    fun getEntries(empId: String): Flow<List<EntryEntity>>

    @Query("SELECT * FROM work_entries WHERE id = :id LIMIT 1")
    suspend fun getEntryById(id: String): EntryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntry(entry: EntryEntity)

    @Update
    suspend fun updateEntry(entry: EntryEntity)

    @Query("UPDATE work_entries SET status = 'CANCELLED' WHERE id = :id AND status = 'PENDING'")
    suspend fun cancelEntry(id: String): Int

    // Allocations
    @Query("SELECT SUM(amount) FROM employee_allocations WHERE employeeId = :empId")
    fun getTotalAllocated(empId: String): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllocation(allocation: AllocationEntity)

    // Transactions
    @Query("SELECT * FROM financial_transactions WHERE employeeId = :empId ORDER BY timestamp DESC")
    fun getTransactions(empId: String): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    // Sum of withdrawals
    @Query("SELECT SUM(withdrawalAmount) FROM work_entries WHERE employeeId = :empId AND status = 'APPROVED'")
    fun getApprovedWithdrawalsSum(empId: String): Flow<Double?>

    @Query("SELECT SUM(withdrawalAmount) FROM work_entries WHERE employeeId = :empId AND status = 'PENDING'")
    fun getPendingWithdrawalsSum(empId: String): Flow<Double?>
}
