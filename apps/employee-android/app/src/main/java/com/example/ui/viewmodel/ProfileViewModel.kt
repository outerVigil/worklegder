package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.TokenStorage
import com.example.data.model.User
import com.example.data.remote.ApiClient
import com.example.data.repository.WorkLedgerRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class ProfileUiState(
    val user: User? = null,
    val backendBaseUrl: String = "",
    val isTestingConnection: Boolean = false,
    val connectionResult: String? = null,
    val isConnectionSuccessful: Boolean? = null,
    val isEditingUrl: Boolean = false,
    val storageAdapter: String = "Private S3 / Local Dev Storage Adapter"
)

class ProfileViewModel(
    private val repository: WorkLedgerRepository,
    private val tokenStorage: TokenStorage,
    private val apiClient: ApiClient
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun initialize() {
        val currentUser = repository.getCurrentUser()
        val currentUrl = tokenStorage.getBaseUrl()
        _uiState.value = _uiState.value.copy(
            user = currentUser,
            backendBaseUrl = currentUrl
        )
    }

    fun onUrlChanged(newUrl: String) {
        _uiState.value = _uiState.value.copy(
            backendBaseUrl = newUrl,
            connectionResult = null,
            isConnectionSuccessful = null
        )
    }

    fun saveBaseUrl() {
        tokenStorage.setBaseUrl(_uiState.value.backendBaseUrl)
        _uiState.value = _uiState.value.copy(
            isEditingUrl = false,
            connectionResult = "Base URL saved! ApiClient updated."
        )
    }

    fun toggleEditUrl() {
        _uiState.value = _uiState.value.copy(isEditingUrl = !_uiState.value.isEditingUrl)
    }

    fun testBackendConnection() {
        _uiState.value = _uiState.value.copy(isTestingConnection = true, connectionResult = null)
        viewModelScope.launch {
            try {
                val service = apiClient.createService()
                val response = withContext(Dispatchers.IO) {
                    service.getMe()
                }
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isTestingConnection = false,
                        isConnectionSuccessful = true,
                        connectionResult = "Successfully connected to Node.js backend API (HTTP ${response.code()})!"
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isTestingConnection = false,
                        isConnectionSuccessful = false,
                        connectionResult = "Backend reached, response: ${response.code()} ${response.message()}"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isTestingConnection = false,
                    isConnectionSuccessful = false,
                    connectionResult = "Connection failed: ${e.localizedMessage ?: "Unable to reach server"}. (Running in standalone offline-ready mode)"
                )
            }
        }
    }
}
