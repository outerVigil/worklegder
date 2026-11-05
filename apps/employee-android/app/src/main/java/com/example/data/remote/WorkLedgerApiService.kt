package com.example.data.remote

import com.example.data.model.ApiResponse
import com.example.data.model.AttendanceRecord
import com.example.data.model.AuthResponse
import com.example.data.model.DailyWorkEntry
import com.example.data.model.FinancialSummary
import com.example.data.model.FinancialTransaction
import com.example.data.model.User
import com.squareup.moshi.JsonClass
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

@JsonClass(generateAdapter = true)
data class LoginRequest(
    val identifier: String,
    val password: String
)

@JsonClass(generateAdapter = true)
data class CheckInRequest(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val deviceTimestamp: String
)

@JsonClass(generateAdapter = true)
data class CheckOutRequest(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val deviceTimestamp: String,
    val remarks: String? = null
)

@JsonClass(generateAdapter = true)
data class CreateEntryRequest(
    val websiteUrl: String,
    val bankAccountNumber: String,
    val referenceId: String,
    val amount: Double,
    val withdrawalAmount: Double,
    val screenshotDataUrl: String
)

@JsonClass(generateAdapter = true)
data class PresignUploadRequest(
    val fileName: String,
    val mimeType: String,
    val fileSize: Long
)

@JsonClass(generateAdapter = true)
data class PresignUploadResponse(
    val uploadUrl: String,
    val publicUrl: String,
    val fileKey: String
)

@JsonClass(generateAdapter = true)
data class DashboardResponse(
    val user: User,
    val activeAttendance: AttendanceRecord?,
    val financialSummary: FinancialSummary,
    val pendingEntriesCount: Int,
    val recentEntries: List<DailyWorkEntry>
)

interface WorkLedgerApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Unit>>

    @GET("auth/me")
    suspend fun getMe(): Response<ApiResponse<User>>

    @GET("employee/dashboard")
    suspend fun getDashboard(): Response<ApiResponse<DashboardResponse>>

    @GET("employee/profile")
    suspend fun getProfile(): Response<ApiResponse<User>>

    @GET("employee/attendance/history")
    suspend fun getAttendanceHistory(): Response<ApiResponse<List<AttendanceRecord>>>

    @POST("employee/attendance/check-in")
    suspend fun checkIn(@Body request: CheckInRequest): Response<ApiResponse<AttendanceRecord>>

    @POST("employee/attendance/check-out")
    suspend fun checkOut(@Body request: CheckOutRequest): Response<ApiResponse<AttendanceRecord>>

    @POST("employee/uploads/presign")
    suspend fun getPresignedUploadUrl(@Body request: PresignUploadRequest): Response<ApiResponse<PresignUploadResponse>>

    @POST("employee/entries")
    suspend fun submitEntry(@Body request: CreateEntryRequest): Response<ApiResponse<DailyWorkEntry>>

    @GET("employee/entries")
    suspend fun getEntries(): Response<ApiResponse<List<DailyWorkEntry>>>

    @GET("employee/entries/{id}")
    suspend fun getEntryById(@Path("id") id: String): Response<ApiResponse<DailyWorkEntry>>

    @POST("employee/entries/{id}/cancel")
    suspend fun cancelEntry(@Path("id") id: String): Response<ApiResponse<DailyWorkEntry>>

    @GET("employee/finance/balance")
    suspend fun getBalance(): Response<ApiResponse<FinancialSummary>>

    @GET("employee/finance/history")
    suspend fun getFinancialHistory(): Response<ApiResponse<List<FinancialTransaction>>>
}
