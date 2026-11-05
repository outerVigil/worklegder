package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LockClock
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.GpsAccuracyMeter
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.viewmodel.AttendanceUiState
import java.util.Locale

@Composable
fun CheckOutScreen(
    employeeId: String,
    uiState: AttendanceUiState,
    onCheckOutClick: (remarks: String) -> Unit,
    onNavigateBack: () -> Unit
) {
    var remarks by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = NavyDark
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "End Attendance Shift",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
                Text(
                    text = "Check-Out & Log Total Work Duration",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Live Shift Duration Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFD1FAE5)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(EmeraldAccent)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "ACTIVE SESSION",
                            color = Color(0xFF065F46),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = uiState.elapsedShiftTime,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = NavyDark,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "Elapsed Shift Duration",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Shift Details Table
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFF8FAFC),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Shift Started", fontSize = 12.sp, color = SlateMuted)
                            Text(
                                text = uiState.activeAttendance?.checkInTime ?: "--:--",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = NavyDark
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Check-In Accuracy", fontSize = 12.sp, color = SlateMuted)
                            Text(
                                text = "±${uiState.activeAttendance?.checkInAccuracy?.toInt() ?: 8}m",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = EmeraldAccent
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Midnight Rollover Support", fontSize = 12.sp, color = SlateMuted)
                            Text(
                                text = "Active (Automatic)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TealPrimary
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Foreground GPS Verification for Checkout
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Check-Out Location Verification",
                    style = MaterialTheme.typography.titleMedium,
                    color = NavyDark
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = String.format(Locale.US, "Lat: %.4f°", uiState.currentLatitude ?: 37.7749),
                        fontSize = 12.sp,
                        color = NavyDark
                    )
                    Text(
                        text = String.format(Locale.US, "Lng: %.4f°", uiState.currentLongitude ?: -122.4194),
                        fontSize = 12.sp,
                        color = NavyDark
                    )
                    Text(
                        text = "±${uiState.currentAccuracy?.toInt() ?: 8}m",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldAccent
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                GpsAccuracyMeter(
                    accuracyMeters = uiState.currentAccuracy,
                    isLocating = uiState.isLocating
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Shift Notes (Optional)
        OutlinedTextField(
            value = remarks,
            onValueChange = { remarks = it },
            label = { Text("Shift Completion Notes (Optional)") },
            placeholder = { Text("e.g. Completed scheduled client campaign reviews.") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = TealPrimary,
                unfocusedBorderColor = BorderLight
            )
        )

        if (uiState.error != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
            ) {
                Text(
                    text = uiState.error,
                    color = Color(0xFF991B1B),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Check Out Button
        Button(
            onClick = { onCheckOutClick(remarks) },
            enabled = !uiState.isLoading,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("check_out_button"),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFDC2626),
                contentColor = Color.White
            )
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.5.dp
                )
            } else {
                Icon(
                    imageVector = Icons.Default.LockClock,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Confirm Shift Check-Out",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
