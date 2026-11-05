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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.DailyWorkEntry
import com.example.data.model.EntryStatus
import com.example.ui.components.StatusBadge
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.viewmodel.EntryHistoryState
import java.util.Locale

@Composable
fun EntryHistoryScreen(
    employeeId: String,
    historyState: EntryHistoryState,
    onFilterChanged: (EntryStatus?) -> Unit,
    onCancelEntry: (entryId: String) -> Unit,
    onNavigateBack: () -> Unit
) {
    var entryToCancel by remember { mutableStateOf<DailyWorkEntry?>(null) }
    var previewScreenshotUrl by remember { mutableStateOf<String?>(null) }

    // Cancel Confirmation Dialog
    if (entryToCancel != null) {
        AlertDialog(
            onDismissRequest = { entryToCancel = null },
            title = {
                Text(
                    text = "Cancel Pending Entry?",
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
            },
            text = {
                Text(
                    text = "Are you sure you want to cancel entry #${entryToCancel?.referenceId}? Any reserved withdrawal funds ($${entryToCancel?.withdrawalAmount}) will be released back to your available balance immediately.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = NavyMedium
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val id = entryToCancel!!.id
                        entryToCancel = null
                        onCancelEntry(id)
                    }
                ) {
                    Text("Confirm Cancellation", color = Color(0xFFDC2626), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { entryToCancel = null }) {
                    Text("Keep Entry", color = SlateMuted)
                }
            }
        )
    }

    // Screenshot Fullscreen Modal
    if (previewScreenshotUrl != null) {
        AlertDialog(
            onDismissRequest = { previewScreenshotUrl = null },
            title = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("UPI Payment Screenshot", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = NavyDark)
                    IconButton(onClick = { previewScreenshotUrl = null }) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = SlateMuted)
                    }
                }
            },
            text = {
                AsyncImage(
                    model = previewScreenshotUrl,
                    contentDescription = "Full screenshot",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(280.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Fit
                )
            },
            confirmButton = {}
        )
    }

    val filteredList = if (historyState.selectedFilter == null) {
        historyState.entries
    } else {
        historyState.entries.filter { it.status == historyState.selectedFilter }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
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
                    text = "Daily Entry History",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
                Text(
                    text = "Review Status, Revisions & Admin Remarks",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Status Filter Chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    selected = historyState.selectedFilter == null,
                    onClick = { onFilterChanged(null) },
                    label = { Text("All (${historyState.entries.size})") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = TealPrimary,
                        selectedLabelColor = Color.White
                    )
                )
            }
            EntryStatus.values().forEach { status ->
                val count = historyState.entries.count { it.status == status }
                item {
                    FilterChip(
                        selected = historyState.selectedFilter == status,
                        onClick = { onFilterChanged(status) },
                        label = { Text("${status.name} ($count)") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = TealPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Feedback messages
        if (historyState.actionMessage != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5))
            ) {
                Text(
                    text = historyState.actionMessage,
                    color = Color(0xFF065F46),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(10.dp)
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        // Entries List
        if (filteredList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.History,
                        contentDescription = null,
                        tint = SlateMuted,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No entries found",
                        fontWeight = FontWeight.Bold,
                        color = NavyDark
                    )
                    Text(
                        text = "There are no entries under the selected filter.",
                        fontSize = 12.sp,
                        color = SlateMuted
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredList) { entry ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            // Top Row: Ref ID + Status
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = entry.referenceId,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = NavyDark
                                    )
                                    Text(
                                        text = entry.createdAt.substringBefore("T") + " • " + entry.createdAt.substringAfter("T").substringBefore("Z"),
                                        fontSize = 11.sp,
                                        color = SlateMuted
                                    )
                                }
                                StatusBadge(status = entry.status)
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Website and Bank Info
                            Text(
                                text = "Website: ${entry.websiteUrl}",
                                fontSize = 12.sp,
                                color = NavyMedium,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Bank Account: ${entry.bankAccountNumberMasked}",
                                fontSize = 12.sp,
                                color = SlateMuted
                            )

                            Spacer(modifier = Modifier.height(10.dp))

                            // Financial breakdown
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFFF8FAFC),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column {
                                        Text("Work Amount", fontSize = 10.sp, color = SlateMuted)
                                        Text(
                                            "$${String.format(Locale.US, "%,.2f", entry.amount)}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = NavyDark
                                        )
                                    }
                                    Column {
                                        Text("Withdrawal Request", fontSize = 10.sp, color = SlateMuted)
                                        Text(
                                            "$${String.format(Locale.US, "%,.2f", entry.withdrawalAmount)}",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = TealPrimary
                                        )
                                    }
                                }
                            }

                            // Screenshot thumbnail & actions row
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (entry.screenshotUrl.isNotBlank()) {
                                    Row(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .clickable { previewScreenshotUrl = entry.screenshotUrl }
                                            .padding(vertical = 4.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Image,
                                            contentDescription = null,
                                            tint = TealPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "View UPI Screenshot",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = TealPrimary
                                        )
                                    }
                                } else {
                                    Spacer(modifier = Modifier.width(1.dp))
                                }

                                // Cancel button for PENDING entries
                                if (entry.status == EntryStatus.PENDING) {
                                    OutlinedButton(
                                        onClick = { entryToCancel = entry },
                                        shape = RoundedCornerShape(8.dp),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFCA5A5)),
                                        colors = androidx.compose.material3.ButtonDefaults.outlinedButtonColors(
                                            contentColor = Color(0xFFDC2626)
                                        )
                                    ) {
                                        Text("Cancel Entry", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            // Admin Remarks or Rejection Reason
                            if (!entry.adminRemarks.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFF0FDF4),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "Admin Remark: ${entry.adminRemarks}",
                                        fontSize = 11.sp,
                                        color = Color(0xFF166534),
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                            }

                            if (!entry.rejectionReason.isNullOrBlank()) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = Color(0xFFFEF2F2),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "Rejection Reason: ${entry.rejectionReason}",
                                        fontSize = 11.sp,
                                        color = Color(0xFF991B1B),
                                        modifier = Modifier.padding(8.dp)
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
    }
}
