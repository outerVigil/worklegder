package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.NetworkCheck
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.SupervisorAccount
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.viewmodel.ProfileUiState

@Composable
fun ProfileScreen(
    uiState: ProfileUiState,
    onUrlChanged: (String) -> Unit,
    onSaveUrl: () -> Unit,
    onToggleEditUrl: () -> Unit,
    onTestConnection: () -> Unit,
    onLogoutClick: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val user = uiState.user

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
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
                        text = "Employee Profile",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                    Text(
                        text = "Identity, Assignment & Server Settings",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted
                    )
                }
            }
        }

        // Profile Avatar Card
        item {
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
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFCCFBF1)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = user?.name?.split(" ")?.mapNotNull { it.firstOrNull()?.toString() }?.joinToString("") ?: "EM",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = TealPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = user?.name ?: "John Doe",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "ID: ${user?.employeeId ?: "EMP-1082"}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SlateMuted
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFD1FAE5)
                    ) {
                        Text(
                            text = "STATUS: ${user?.status ?: "ACTIVE"} • EMPLOYEE ROLE",
                            color = Color(0xFF065F46),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }

        // Employee Details
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Personnel Details",
                        style = MaterialTheme.typography.titleMedium,
                        color = NavyDark
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    ProfileDetailRow(
                        icon = Icons.Default.Email,
                        label = "Email Address",
                        value = user?.email ?: "emp101@company.com"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    ProfileDetailRow(
                        icon = Icons.Default.Phone,
                        label = "Contact Phone",
                        value = user?.phone ?: "+1 (555) 234-5678"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    ProfileDetailRow(
                        icon = Icons.Default.SupervisorAccount,
                        label = "Assigned Sub-Admin",
                        value = user?.assignedSubAdmin ?: "Admin Sarah Jenkins"
                    )
                }
            }
        }

        // Backend Connection & API Settings Card
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
                            text = "Backend Server Integration",
                            style = MaterialTheme.typography.titleMedium,
                            color = NavyDark
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFE0F2FE)
                        ) {
                            Text(
                                text = "REST v1",
                                color = Color(0xFF0284C7),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Base API URL (Shared Node.js Backend):",
                        fontSize = 12.sp,
                        color = SlateMuted
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    if (uiState.isEditingUrl) {
                        OutlinedTextField(
                            value = uiState.backendBaseUrl,
                            onValueChange = onUrlChanged,
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TealPrimary,
                                unfocusedBorderColor = BorderLight
                            )
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = onSaveUrl,
                                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Save URL", fontSize = 12.sp)
                            }
                            OutlinedButton(
                                onClick = onToggleEditUrl,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Cancel", fontSize = 12.sp, color = NavyMedium)
                            }
                        }
                    } else {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFF8FAFC))
                                .padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = uiState.backendBaseUrl,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = NavyDark,
                                modifier = Modifier.weight(1f)
                            )
                            Text(
                                text = "Edit",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = TealPrimary,
                                modifier = Modifier.clickable { onToggleEditUrl() }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Ping Backend Test Button
                    OutlinedButton(
                        onClick = onTestConnection,
                        enabled = !uiState.isTestingConnection,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(
                            contentColor = TealPrimary
                        )
                    ) {
                        if (uiState.isTestingConnection) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = TealPrimary,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.NetworkCheck,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Ping Backend API Health", fontSize = 13.sp)
                        }
                    }

                    // Connection test result message
                    if (uiState.connectionResult != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (uiState.isConnectionSuccessful == true) Color(0xFFD1FAE5) else Color(0xFFFEF3C7),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = uiState.connectionResult,
                                fontSize = 11.sp,
                                color = if (uiState.isConnectionSuccessful == true) Color(0xFF065F46) else Color(0xFF92400E),
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Storage: ${uiState.storageAdapter}",
                        fontSize = 11.sp,
                        color = SlateMuted
                    )
                }
            }
        }

        // Logout Button
        item {
            Button(
                onClick = onLogoutClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("logout_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFEE2E2),
                    contentColor = Color(0xFFDC2626)
                )
            ) {
                Icon(
                    imageVector = Icons.Default.ExitToApp,
                    contentDescription = null,
                    tint = Color(0xFFDC2626),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Sign Out of Employee Session",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun ProfileDetailRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFFF1F5F9)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = SlateMuted,
                modifier = Modifier.size(18.dp)
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, fontSize = 11.sp, color = SlateMuted)
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = NavyDark)
        }
    }
}
