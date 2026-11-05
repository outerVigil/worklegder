package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.User
import com.example.data.repository.WorkLedgerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val identifierInput: String = "emp101@company.com",
    val passwordInput: String = "password123",
    val isPasswordVisible: Boolean = false
)

class AuthViewModel(
    private val repository: WorkLedgerRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        checkSession()
    }

    private fun checkSession() {
        val user = repository.getCurrentUser()
        if (user != null && repository.isLoggedIn()) {
            _uiState.value = _uiState.value.copy(
                isLoggedIn = true,
                user = user
            )
        }
    }

    fun onIdentifierChanged(value: String) {
        _uiState.value = _uiState.value.copy(identifierInput = value, error = null)
    }

    fun onPasswordChanged(value: String) {
        _uiState.value = _uiState.value.copy(passwordInput = value, error = null)
    }

    fun togglePasswordVisibility() {
        _uiState.value = _uiState.value.copy(isPasswordVisible = !_uiState.value.isPasswordVisible)
    }

    fun selectDemoAccount(email: String, name: String) {
        _uiState.value = _uiState.value.copy(
            identifierInput = email,
            passwordInput = "demoPass123",
            error = null
        )
    }

    fun login() {
        val state = _uiState.value
        if (state.identifierInput.isBlank()) {
            _uiState.value = state.copy(error = "Please enter your Employee ID or Email")
            return
        }
        if (state.passwordInput.isBlank()) {
            _uiState.value = state.copy(error = "Please enter your password")
            return
        }

        _uiState.value = state.copy(isLoading = true, error = null)

        viewModelScope.launch {
            val result = repository.login(state.identifierInput.trim(), state.passwordInput)
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isLoggedIn = true,
                    user = result.getOrNull(),
                    error = null
                )
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message ?: "Login failed. Please check your credentials."
                )
            }
        }
    }

    fun logout() {
        repository.logout()
        _uiState.value = AuthUiState(
            isLoggedIn = false,
            user = null,
            identifierInput = "emp101@company.com",
            passwordInput = "password123"
        )
    }
}
