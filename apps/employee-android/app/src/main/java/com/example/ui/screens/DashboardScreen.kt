package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LockClock
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.PendingActions
import androidx.compose.material.icons.filled.PostAdd
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AttendanceRecord
import com.example.data.model.DailyWorkEntry
import com.example.data.model.FinancialSummary
import com.example.data.model.User
import com.example.ui.components.StatusBadge
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.theme.TealPrimaryDark
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DashboardScreen(
    user: User?,
    financialSummary: FinancialSummary,
    activeAttendance: AttendanceRecord?,
    lastAttendance: AttendanceRecord?,
    elapsedShiftTime: String,
    recentEntries: List<DailyWorkEntry>,
    onNavigateToCheckIn: () -> Unit,
    onNavigateToCheckOut: () -> Unit,
    onNavigateToNewEntry: () -> Unit,
    onNavigateToEntryHistory: () -> Unit,
    onNavigateToFinanceHistory: () -> Unit
) {
    val todayFormatted = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.US).format(Date())
    val isCheckedIn = activeAttendance != null

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            // Employee Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Hello, ${user?.name ?: "Employee"}",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "ID: ${user?.employeeId ?: "EMP-1082"} • $todayFormatted",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted
                    )
                }

                // Attendance Status Chip
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (isCheckedIn) Color(0xFFD1FAE5) else Color(0xFFF1F5F9),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isCheckedIn) Color(0xFFA7F3D0) else BorderLight
                    ),
                    modifier = Modifier.clickable {
                        if (isCheckedIn) onNavigateToCheckOut() else onNavigateToCheckIn()
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isCheckedIn) EmeraldAccent else SlateMuted)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isCheckedIn) "ON SHIFT ($elapsedShiftTime)" else "CHECKED OUT",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (isCheckedIn) Color(0xFF065F46) else NavyMedium
                        )
                    }
                }
            }
        }

        // Available Balance Hero Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToFinanceHistory() },
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(TealPrimaryDark, TealPrimary)
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "AVAILABLE BALANCE",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFCCFBF1),
                                letterSpacing = 1.sp
                            )
                            Icon(
                                imageVector = Icons.Default.AccountBalanceWallet,
                                contentDescription = null,
                                tint = Color(0xFFCCFBF1),
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "$${String.format(Locale.US, "%,.2f", financialSummary.availableBalance)}",
                            style = MaterialTheme.typography.displayLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Ledger Breakdown Row
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color.White.copy(alpha = 0.12f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("Allocated", fontSize = 10.sp, color = Color(0xFFCCFBF1))
                                    Text(
                                        "$${String.format(Locale.US, "%,.0f", financialSummary.totalAllocated)}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                                Text("-", color = Color(0xFFCCFBF1), modifier = Modifier.align(Alignment.CenterVertically))
                                Column {
                                    Text("Approved Withdrawn", fontSize = 10.sp, color = Color(0xFFCCFBF1))
                                    Text(
                                        "$${String.format(Locale.US, "%,.0f", financialSummary.approvedWithdrawals)}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                                Text("-", color = Color(0xFFCCFBF1), modifier = Modifier.align(Alignment.CenterVertically))
                                Column {
                                    Text("Pending Requests", fontSize = 10.sp, color = Color(0xFFCCFBF1))
                                    Text(
                                        "$${String.format(Locale.US, "%,.0f", financialSummary.pendingWithdrawals)}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFFDE68A)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Quick Actions Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Check In/Out Action
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable {
                            if (isCheckedIn) onNavigateToCheckOut() else onNavigateToCheckIn()
                        }
                        .testTag("action_attendance"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isCheckedIn) Color(0xFFFEE2E2) else Color(0xFFCCFBF1)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isCheckedIn) Icons.Default.LockClock else Icons.Default.Schedule,
                                contentDescription = null,
                                tint = if (isCheckedIn) Color(0xFFDC2626) else TealPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = if (isCheckedIn) "Check Out" else "Check In",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = NavyDark
                        )
                        Text(
                            text = if (isCheckedIn) "End current shift" else "Foreground GPS",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                    }
                }

                // Daily Entry Action
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToNewEntry() }
                        .testTag("action_new_entry"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFE0F2FE)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PostAdd,
                                contentDescription = null,
                                tint = Color(0xFF0284C7),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Daily Entry",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = NavyDark
                        )
                        Text(
                            text = "Submit UPI work",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                    }
                }

                // Financial Ledger History Action
                Card(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onNavigateToFinanceHistory() }
                        .testTag("action_ledger"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFFEF3C7)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Payment,
                                contentDescription = null,
                                tint = Color(0xFFD97706),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "Ledger",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = NavyDark
                        )
                        Text(
                            text = "View transactions",
                            fontSize = 11.sp,
                            color = SlateMuted
                        )
                    }
                }
            }
        }

        // Attendance Summary Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Today's Attendance Session",
                            style = MaterialTheme.typography.titleMedium,
                            color = NavyDark
                        )
                        Text(
                            text = if (isCheckedIn) "Active Now" else "Inactive",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isCheckedIn) EmeraldAccent else SlateMuted
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (isCheckedIn) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Check-In Time", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = activeAttendance?.checkInTime?.substringAfter("T")?.substringBefore("Z") ?: "--:--",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = NavyDark
                                )
                            }
                            Column {
                                Text("GPS Accuracy", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = "±${activeAttendance?.checkInAccuracy?.toInt() ?: 8}m (Verified)",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = EmeraldAccent
                                )
                            }
                            Column {
                                Text("Elapsed Time", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = elapsedShiftTime,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TealPrimary
                                )
                            }
                        }
                    } else if (lastAttendance != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Last Check-In", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = lastAttendance.checkInTime.substringAfter("T").substringBefore("Z"),
                                    fontSize = 13.sp,
                                    color = NavyDark
                                )
                            }
                            Column {
                                Text("Last Check-Out", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = lastAttendance.checkOutTime?.substringAfter("T")?.substringBefore("Z") ?: "--:--",
                                    fontSize = 13.sp,
                                    color = NavyDark
                                )
                            }
                            Column {
                                Text("Duration", fontSize = 11.sp, color = SlateMuted)
                                Text(
                                    text = "${lastAttendance.durationMinutes / 60}h ${lastAttendance.durationMinutes % 60}m",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = NavyDark
                                )
                            }
                        }
                    } else {
                        Text(
                            text = "No attendance session started today. Please complete GPS check-in to begin logging work entries.",
                            style = MaterialTheme.typography.bodySmall,
                            color = SlateMuted
                        )
                    }
                }
            }
        }

        // Recent Work Activity Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Daily Entries",
                    style = MaterialTheme.typography.titleMedium,
                    color = NavyDark
                )
                Text(
                    text = "View All (${recentEntries.size})",
                    style = MaterialTheme.typography.labelSmall,
                    color = TealPrimary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onNavigateToEntryHistory() }
                )
            }
        }

        // Recent entries list
        if (recentEntries.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.PendingActions,
                            contentDescription = null,
                            tint = SlateMuted,
                            modifier = Modifier.size(36.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No entries submitted yet",
                            fontWeight = FontWeight.SemiBold,
                            color = NavyDark
                        )
                        Text(
                            text = "Tap 'Daily Entry' to submit your work and withdrawal request.",
                            fontSize = 12.sp,
                            color = SlateMuted
                        )
                    }
                }
            }
        } else {
            items(recentEntries.take(4)) { entry ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onNavigateToEntryHistory() },
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = entry.referenceId,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = NavyDark
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                StatusBadge(status = entry.status)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = entry.websiteUrl,
                                fontSize = 12.sp,
                                color = SlateMuted,
                                maxLines = 1
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "$${String.format(Locale.US, "%,.2f", entry.amount)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = NavyDark
                            )
                            Text(
                                text = "Req: $${String.format(Locale.US, "%,.2f", entry.withdrawalAmount)}",
                                fontSize = 11.sp,
                                color = TealPrimary,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}
