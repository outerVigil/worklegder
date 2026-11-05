package com.example.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Numbers
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.ui.theme.BorderLight
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyMedium
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary
import com.example.ui.viewmodel.EntryFormState
import java.util.Locale

@Composable
fun DailyEntryScreen(
    formState: EntryFormState,
    onWebsiteChanged: (String) -> Unit,
    onBankChanged: (String) -> Unit,
    onReferenceChanged: (String) -> Unit,
    onAmountChanged: (String) -> Unit,
    onWithdrawalAmountChanged: (String) -> Unit,
    onScreenshotSelected: (Uri?) -> Unit,
    onUseSampleScreenshot: (String) -> Unit,
    onSubmitClick: () -> Unit,
    onClearFeedback: () -> Unit,
    onNavigateBack: () -> Unit
) {
    var showConfirmDialog by remember { mutableStateOf(false) }

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        onScreenshotSelected(uri)
    }

    if (showConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmDialog = false },
            title = {
                Text(
                    text = "Confirm Entry Submission",
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
            },
            text = {
                Column {
                    Text(
                        text = "Are you sure you want to submit this daily work entry? This will reserve $${formState.withdrawalAmount.ifBlank { "0" }} in the financial ledger.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = NavyMedium
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "• Ref: ${formState.referenceId}\n• Bank Account: •••• ${formState.bankAccountNumber.takeLast(4)}\n• Amount: $${formState.amount}",
                        fontSize = 12.sp,
                        color = SlateMuted
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmDialog = false
                        onSubmitClick()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text("Confirm & Submit")
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDialog = false }) {
                    Text("Cancel", color = SlateMuted)
                }
            }
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top Header
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
                    text = "Daily Work Entry",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = NavyDark
                )
                Text(
                    text = "All 6 Fields Mandatory • Secure Ledger Integration",
                    style = MaterialTheme.typography.bodySmall,
                    color = SlateMuted
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Balance Available Notice Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
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
                Column {
                    Text(
                        text = "Available Balance for Withdrawal",
                        style = MaterialTheme.typography.labelSmall,
                        color = SlateMuted
                    )
                    Text(
                        text = "$${String.format(Locale.US, "%,.2f", formState.availableBalance)}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = TealPrimary
                    )
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFCCFBF1)
                ) {
                    Text(
                        text = "Live Limit",
                        color = Color(0xFF115E59),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Success message banner
        if (formState.submissionSuccessMessage != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFD1FAE5))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = EmeraldAccent,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = formState.submissionSuccessMessage,
                        color = Color(0xFF065F46),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // General error banner
        if (formState.generalError != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFEE2E2))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color(0xFFDC2626),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = formState.generalError,
                        color = Color(0xFF991B1B),
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Form Fields Container
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {

                // Field 1: Website Details
                Text("1. Website Details *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = formState.websiteUrl,
                    onValueChange = onWebsiteChanged,
                    placeholder = { Text("https://portal.clientdomain.com/task/88") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Language, contentDescription = null, tint = SlateMuted)
                    },
                    isError = formState.websiteError != null,
                    supportingText = formState.websiteError?.let { { Text(it, color = Color(0xFFDC2626)) } },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("entry_website_input"),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri, imeAction = ImeAction.Next),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = BorderLight
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Field 2: Bank Account Number
                Text("2. Bank Account Number *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = formState.bankAccountNumber,
                    onValueChange = onBankChanged,
                    placeholder = { Text("Enter bank account number (digits)") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.AccountBalance, contentDescription = null, tint = SlateMuted)
                    },
                    isError = formState.bankError != null,
                    supportingText = {
                        if (formState.bankError != null) {
                            Text(formState.bankError, color = Color(0xFFDC2626))
                        } else if (formState.bankAccountNumber.length >= 4) {
                            Text(
                                "Masked Preview: •••• •••• ${formState.bankAccountNumber.takeLast(4)} (Encrypted)",
                                color = EmeraldAccent
                            )
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("entry_bank_input"),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = BorderLight
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Field 3: Reference ID
                Text("3. Reference ID *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = formState.referenceId,
                    onValueChange = onReferenceChanged,
                    placeholder = { Text("e.g. REF-2026-9102") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.Numbers, contentDescription = null, tint = SlateMuted)
                    },
                    isError = formState.referenceError != null,
                    supportingText = formState.referenceError?.let { { Text(it, color = Color(0xFFDC2626)) } },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("entry_reference_input"),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = BorderLight
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Field 4: Amount
                Text("4. Total Work Amount ($) *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = formState.amount,
                    onValueChange = onAmountChanged,
                    placeholder = { Text("0.00") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.AttachMoney, contentDescription = null, tint = SlateMuted)
                    },
                    isError = formState.amountError != null,
                    supportingText = formState.amountError?.let { { Text(it, color = Color(0xFFDC2626)) } },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("entry_amount_input"),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal, imeAction = ImeAction.Next),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = BorderLight
                    )
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Field 5: UPI Screenshot Upload
                Text("5. UPI Payment Screenshot *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))

                // Screenshot Preview & Selector Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .border(1.dp, if (formState.screenshotError != null) Color(0xFFDC2626) else BorderLight, RoundedCornerShape(12.dp))
                        .background(Color(0xFFF8FAFC))
                        .padding(12.dp)
                ) {
                    if (formState.screenshotPreviewUrl != null || formState.screenshotUri != null) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = EmeraldAccent,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Screenshot Attached & Validated",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = EmeraldAccent
                                    )
                                }
                                Text(
                                    text = "Change",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TealPrimary,
                                    modifier = Modifier.clickable {
                                        photoPickerLauncher.launch(
                                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                        )
                                    }
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            AsyncImage(
                                model = formState.screenshotUri ?: formState.screenshotPreviewUrl,
                                contentDescription = "UPI Screenshot Preview",
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp)
                                    .clip(RoundedCornerShape(8.dp)),
                                contentScale = ContentScale.Crop
                            )
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddPhotoAlternate,
                                contentDescription = null,
                                tint = TealPrimary,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Attach UPI Transaction Screenshot",
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = NavyDark
                            )
                            Text(
                                text = "JPEG, PNG up to 10MB",
                                fontSize = 11.sp,
                                color = SlateMuted
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = {
                                        photoPickerLauncher.launch(
                                            PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                        )
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Pick from Gallery", fontSize = 12.sp)
                                }
                                OutlinedButton(
                                    onClick = {
                                        onUseSampleScreenshot("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500")
                                    },
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Demo Sample", fontSize = 12.sp, color = NavyMedium)
                                }
                            }
                        }
                    }
                }
                if (formState.screenshotError != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = formState.screenshotError,
                        color = Color(0xFFDC2626),
                        fontSize = 12.sp
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Field 6: Withdrawal Amount
                Text("6. Withdrawal Request Amount ($) *", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = NavyDark)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = formState.withdrawalAmount,
                    onValueChange = onWithdrawalAmountChanged,
                    placeholder = { Text("0.00") },
                    leadingIcon = {
                        Icon(imageVector = Icons.Default.AttachMoney, contentDescription = null, tint = SlateMuted)
                    },
                    isError = formState.withdrawalError != null,
                    supportingText = {
                        if (formState.withdrawalError != null) {
                            Text(formState.withdrawalError, color = Color(0xFFDC2626))
                        } else {
                            Text(
                                "Cannot exceed available balance ($${String.format(Locale.US, "%,.2f", formState.availableBalance)})",
                                color = SlateMuted
                            )
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("entry_withdrawal_input"),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal, imeAction = ImeAction.Done),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TealPrimary,
                        unfocusedBorderColor = BorderLight
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Submit Button (Prevents duplicate submissions)
        Button(
            onClick = { showConfirmDialog = true },
            enabled = !formState.isSubmitting,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("submit_entry_button"),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = TealPrimary,
                contentColor = Color.White
            )
        ) {
            if (formState.isSubmitting) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = Color.White,
                    strokeWidth = 2.5.dp
                )
            } else {
                Text(
                    text = "Submit Entry & Reserve Ledger Funds",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}
