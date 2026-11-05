package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.FinancialSummary
import com.example.data.model.FinancialTransaction
import com.example.data.repository.WorkLedgerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class FinanceUiState(
    val summary: FinancialSummary = FinancialSummary(0.0, 0.0, 0.0, 0.0),
    val transactions: List<FinancialTransaction> = emptyList(),
    val isLoading: Boolean = false,
    val currencySymbol: String = "$"
)

class FinanceViewModel(
    private val repository: WorkLedgerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FinanceUiState())
    val uiState: StateFlow<FinanceUiState> = _uiState.asStateFlow()

    fun initialize(employeeId: String) {
        viewModelScope.launch {
            repository.getFinancialSummary(employeeId).collect { summary ->
                _uiState.value = _uiState.value.copy(summary = summary)
            }
        }

        viewModelScope.launch {
            repository.getTransactions(employeeId).collect { transactions ->
                _uiState.value = _uiState.value.copy(transactions = transactions)
            }
        }
    }
}
