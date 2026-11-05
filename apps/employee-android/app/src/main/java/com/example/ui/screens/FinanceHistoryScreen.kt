package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Paid
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.FinancialSummary
import com.example.data.model.FinancialTransaction
import com.example.data.model.TransactionType
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.theme.TealPrimaryDark
import java.util.Locale

@Composable
fun FinanceHistoryScreen(
    financialSummary: FinancialSummary,
    transactions: List<FinancialTransaction>,
    onNavigateBack: () -> Unit
) {
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
                        text = "Balance & Financial Ledger",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                    Text(
                        text = "Centralized Immutable Ledger & Allocations",
                        style = MaterialTheme.typography.bodySmall,
                        color = SlateMuted
                    )
                }
            }
        }

        // Available Balance Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
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
                                text = "CURRENT AVAILABLE BALANCE",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFCCFBF1),
                                letterSpacing = 1.sp
                            )
                            Icon(
                                imageVector = Icons.Default.Paid,
                                contentDescription = null,
                                tint = Color(0xFFCCFBF1),
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "$${String.format(Locale.US, "%,.2f", financialSummary.availableBalance)}",
                            fontSize = 34.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Ledger Formula Explanation Box
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color.White.copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Calculate,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Formula: Available = Allocated - Approved - Pending",
                                    fontSize = 11.sp,
                                    color = Color.White,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }

        // Ledger Breakdown Cards Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Total Allocated
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Total Allocated", fontSize = 11.sp, color = SlateMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "$${String.format(Locale.US, "%,.0f", financialSummary.totalAllocated)}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = NavyDark
                        )
                        Text("Approved Capital", fontSize = 10.sp, color = EmeraldAccent)
                    }
                }

                // Approved Withdrawals
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Approved Withdrawn", fontSize = 11.sp, color = SlateMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "$${String.format(Locale.US, "%,.0f", financialSummary.approvedWithdrawals)}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = NavyDark
                        )
                        Text("Settled Deductions", fontSize = 10.sp, color = Color(0xFFDC2626))
                    }
                }

                // Pending Requests
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Pending Requests", fontSize = 11.sp, color = SlateMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "$${String.format(Locale.US, "%,.0f", financialSummary.pendingWithdrawals)}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706)
                        )
                        Text("Reserved in Ledger", fontSize = 10.sp, color = Color(0xFFD97706))
                    }
                }
            }
        }

        // Ledger Integrity Guarantee Banner
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF1F5F9))
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = TealPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Row-level locking and atomic transactions prevent overdrawing or duplicate deduction across web and mobile platforms.",
                        style = MaterialTheme.typography.bodySmall,
                        color = NavyMedium
                    )
                }
            }
        }

        // Transactions Stream Header
        item {
            Text(
                text = "Financial Ledger Transactions",
                style = MaterialTheme.typography.titleMedium,
                color = NavyDark
            )
        }

        // Transactions Stream
        if (transactions.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Box(modifier = Modifier.padding(24.dp), contentAlignment = Alignment.Center) {
                        Text("No ledger transactions recorded yet.", color = SlateMuted)
                    }
                }
            }
        } else {
            items(transactions) { tx ->
                val isCredit = tx.type == TransactionType.ALLOCATION_CREDIT || tx.type == TransactionType.RESERVATION_RELEASED
                val iconTint = if (isCredit) EmeraldAccent else Color(0xFFDC2626)
                val icon = if (isCredit) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward

                Card(
                    modifier = Modifier.fillMaxWidth(),
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
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(iconTint.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = null,
                                    tint = iconTint,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = tx.referenceId,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = NavyDark
                                )
                                Text(
                                    text = tx.description,
                                    fontSize = 11.sp,
                                    color = SlateMuted,
                                    maxLines = 1
                                )
                                Text(
                                    text = tx.timestamp.substringBefore("T"),
                                    fontSize = 10.sp,
                                    color = SlateMuted
                                )
                            }
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "${if (isCredit) "+" else "-"}$${String.format(Locale.US, "%,.2f", tx.amount)}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = if (isCredit) EmeraldAccent else NavyDark
                            )
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = if (tx.status == "SETTLED") Color(0xFFD1FAE5) else Color(0xFFFEF3C7)
                            ) {
                                Text(
                                    text = tx.status,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (tx.status == "SETTLED") Color(0xFF065F46) else Color(0xFF92400E),
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
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
