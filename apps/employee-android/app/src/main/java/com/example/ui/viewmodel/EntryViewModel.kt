package com.example.ui.viewmodel

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.DailyWorkEntry
import com.example.data.model.EntryStatus
import com.example.data.model.FinancialSummary
import com.example.data.repository.WorkLedgerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class EntryFormState(
    val websiteUrl: String = "",
    val bankAccountNumber: String = "",
    val referenceId: String = "",
    val amount: String = "",
    val withdrawalAmount: String = "",
    val screenshotUri: Uri? = null,
    val screenshotPreviewUrl: String? = null,
    val isUploadingScreenshot: Boolean = false,
    val uploadProgress: Float = 0f,
    val isSubmitting: Boolean = false,
    val availableBalance: Double = 0.0,
    val websiteError: String? = null,
    val bankError: String? = null,
    val referenceError: String? = null,
    val amountError: String? = null,
    val withdrawalError: String? = null,
    val screenshotError: String? = null,
    val submissionSuccessMessage: String? = null,
    val generalError: String? = null
)

data class EntryHistoryState(
    val entries: List<DailyWorkEntry> = emptyList(),
    val selectedFilter: EntryStatus? = null, // null means ALL
    val isLoading: Boolean = false,
    val cancelingEntryId: String? = null,
    val actionMessage: String? = null,
    val errorMessage: String? = null
)

class EntryViewModel(
    private val repository: WorkLedgerRepository
) : ViewModel() {

    private val _formState = MutableStateFlow(EntryFormState())
    val formState: StateFlow<EntryFormState> = _formState.asStateFlow()

    private val _historyState = MutableStateFlow(EntryHistoryState())
    val historyState: StateFlow<EntryHistoryState> = _historyState.asStateFlow()

    fun initialize(employeeId: String) {
        viewModelScope.launch {
            repository.getFinancialSummary(employeeId).collect { summary: FinancialSummary ->
                _formState.value = _formState.value.copy(availableBalance = summary.availableBalance)
            }
        }
        viewModelScope.launch {
            repository.getEntries(employeeId).collect { entries ->
                _historyState.value = _historyState.value.copy(entries = entries)
            }
        }
    }

    fun onWebsiteChanged(value: String) {
        val error = if (value.isNotBlank() && !value.contains(".")) "Enter a valid URL or domain (e.g. portal.domain.com)" else null
        _formState.value = _formState.value.copy(websiteUrl = value, websiteError = error, generalError = null)
    }

    fun onBankChanged(value: String) {
        val digitsOnly = value.filter { it.isDigit() }
        val error = if (digitsOnly.length in 1..5) "Bank account must be at least 6 digits" else null
        _formState.value = _formState.value.copy(bankAccountNumber = digitsOnly, bankError = error, generalError = null)
    }

    fun onReferenceChanged(value: String) {
        _formState.value = _formState.value.copy(referenceId = value, referenceError = null, generalError = null)
    }

    fun onAmountChanged(value: String) {
        val clean = value.filter { it.isDigit() || it == '.' }
        _formState.value = _formState.value.copy(amount = clean, amountError = null, generalError = null)
    }

    fun onWithdrawalAmountChanged(value: String) {
        val clean = value.filter { it.isDigit() || it == '.' }
        val parsed = clean.toDoubleOrNull() ?: 0.0
        val error = if (parsed > _formState.value.availableBalance) {
            "Withdrawal exceeds available balance ($${String.format(java.util.Locale.US, "%.2f", _formState.value.availableBalance)})"
        } else null
        _formState.value = _formState.value.copy(withdrawalAmount = clean, withdrawalError = error, generalError = null)
    }

    fun onScreenshotSelected(uri: Uri?) {
        if (uri != null) {
            _formState.value = _formState.value.copy(
                screenshotUri = uri,
                screenshotPreviewUrl = uri.toString(),
                screenshotError = null,
                uploadProgress = 1.0f
            )
        }
    }

    fun useSampleScreenshot(sampleUrl: String) {
        _formState.value = _formState.value.copy(
            screenshotPreviewUrl = sampleUrl,
            screenshotError = null,
            uploadProgress = 1.0f
        )
    }

    fun submitEntry(employeeId: String, onSuccess: () -> Unit) {
        val state = _formState.value

        // Prevent duplicate submission while already submitting
        if (state.isSubmitting) return

        var hasError = false
        var webErr: String? = null
        var bankErr: String? = null
        var refErr: String? = null
        var amtErr: String? = null
        var withErr: String? = null
        var scrErr: String? = null

        if (state.websiteUrl.isBlank() || !state.websiteUrl.contains(".")) {
            webErr = "Website details with valid URL required"
            hasError = true
        }
        if (state.bankAccountNumber.length < 6) {
            bankErr = "Valid bank account number required (min 6 digits)"
            hasError = true
        }
        if (state.referenceId.isBlank()) {
            refErr = "Reference ID is mandatory"
            hasError = true
        }
        val amt = state.amount.toDoubleOrNull()
        if (amt == null || amt <= 0) {
            amtErr = "Valid positive amount required"
            hasError = true
        }
        val withAmt = state.withdrawalAmount.toDoubleOrNull()
        if (withAmt == null || withAmt < 0) {
            withErr = "Valid withdrawal amount required"
            hasError = true
        } else if (withAmt > state.availableBalance) {
            withErr = "Withdrawal cannot exceed available balance ($${String.format(java.util.Locale.US, "%.2f", state.availableBalance)})"
            hasError = true
        }
        if (state.screenshotPreviewUrl.isNullOrBlank() && state.screenshotUri == null) {
            scrErr = "UPI payment screenshot is mandatory"
            hasError = true
        }

        if (hasError) {
            _formState.value = state.copy(
                websiteError = webErr,
                bankError = bankErr,
                referenceError = refErr,
                amountError = amtErr,
                withdrawalError = withErr,
                screenshotError = scrErr
            )
            return
        }

        _formState.value = state.copy(isSubmitting = true, generalError = null)

        viewModelScope.launch {
            val screenshot = state.screenshotPreviewUrl ?: state.screenshotUri?.toString() ?: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500"
            val result = repository.submitEntry(
                employeeId = employeeId,
                websiteUrl = state.websiteUrl.trim(),
                bankAccountNumber = state.bankAccountNumber.trim(),
                referenceId = state.referenceId.trim(),
                amount = amt!!,
                withdrawalAmount = withAmt!!,
                screenshotDataUrl = screenshot
            )

            if (result.isSuccess) {
                _formState.value = EntryFormState(
                    availableBalance = (_formState.value.availableBalance - withAmt).coerceAtLeast(0.0),
                    submissionSuccessMessage = "Entry #${state.referenceId} submitted successfully! Funds reserved in ledger."
                )
                onSuccess()
            } else {
                _formState.value = _formState.value.copy(
                    isSubmitting = false,
                    generalError = result.exceptionOrNull()?.message ?: "Submission failed. Please try again."
                )
            }
        }
    }

    fun clearSubmissionFeedback() {
        _formState.value = _formState.value.copy(submissionSuccessMessage = null, generalError = null)
    }

    // --- History Filtering & Cancellation ---
    fun setHistoryFilter(status: EntryStatus?) {
        _historyState.value = _historyState.value.copy(selectedFilter = status)
    }

    fun cancelPendingEntry(entryId: String, employeeId: String) {
        _historyState.value = _historyState.value.copy(cancelingEntryId = entryId, actionMessage = null, errorMessage = null)
        viewModelScope.launch {
            val result = repository.cancelEntry(entryId, employeeId)
            if (result.isSuccess) {
                _historyState.value = _historyState.value.copy(
                    cancelingEntryId = null,
                    actionMessage = "Entry successfully cancelled. Reserved funds released to balance."
                )
            } else {
                _historyState.value = _historyState.value.copy(
                    cancelingEntryId = null,
                    errorMessage = result.exceptionOrNull()?.message ?: "Could not cancel entry."
                )
            }
        }
    }

    fun clearHistoryFeedback() {
        _historyState.value = _historyState.value.copy(actionMessage = null, errorMessage = null)
    }
}
