package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.AppDatabase
import com.example.data.local.TokenStorage
import com.example.data.remote.ApiClient
import com.example.data.repository.WorkLedgerRepository
import com.example.ui.navigation.BottomNavBar
import com.example.ui.navigation.Screen
import com.example.ui.screens.CheckInScreen
import com.example.ui.screens.CheckOutScreen
import com.example.ui.screens.DailyEntryScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.EntryHistoryScreen
import com.example.ui.screens.FinanceHistoryScreen
import com.example.ui.screens.LoginScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.theme.WorkLedgerTheme
import com.example.ui.viewmodel.AttendanceViewModel
import com.example.ui.viewmodel.AuthViewModel
import com.example.ui.viewmodel.EntryViewModel
import com.example.ui.viewmodel.FinanceViewModel
import com.example.ui.viewmodel.ProfileViewModel
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private lateinit var repository: WorkLedgerRepository
    private lateinit var tokenStorage: TokenStorage
    private lateinit var apiClient: ApiClient

    private lateinit var authViewModel: AuthViewModel
    private lateinit var attendanceViewModel: AttendanceViewModel
    private lateinit var entryViewModel: EntryViewModel
    private lateinit var financeViewModel: FinanceViewModel
    private lateinit var profileViewModel: ProfileViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = AppDatabase.getInstance(applicationContext)
        tokenStorage = TokenStorage(applicationContext)
        apiClient = ApiClient(tokenStorage)
        repository = WorkLedgerRepository(database, tokenStorage, apiClient)

        authViewModel = AuthViewModel(repository)
        attendanceViewModel = AttendanceViewModel(repository, applicationContext)
        entryViewModel = EntryViewModel(repository)
        financeViewModel = FinanceViewModel(repository)
        profileViewModel = ProfileViewModel(repository, tokenStorage, apiClient)

        setContent {
            WorkLedgerTheme {
                WorkLedgerApp(
                    authViewModel = authViewModel,
                    attendanceViewModel = attendanceViewModel,
                    entryViewModel = entryViewModel,
                    financeViewModel = financeViewModel,
                    profileViewModel = profileViewModel
                )
            }
        }
    }
}

@Composable
fun WorkLedgerApp(
    authViewModel: AuthViewModel,
    attendanceViewModel: AttendanceViewModel,
    entryViewModel: EntryViewModel,
    financeViewModel: FinanceViewModel,
    profileViewModel: ProfileViewModel
) {
    val authState by authViewModel.uiState.collectAsStateWithLifecycle()
    val attendanceState by attendanceViewModel.uiState.collectAsStateWithLifecycle()
    val formState by entryViewModel.formState.collectAsStateWithLifecycle()
    val historyState by entryViewModel.historyState.collectAsStateWithLifecycle()
    val financeState by financeViewModel.uiState.collectAsStateWithLifecycle()
    val profileState by profileViewModel.uiState.collectAsStateWithLifecycle()

    var currentRoute by remember { mutableStateOf(Screen.Splash.route) }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Initialize ViewModels when user is authenticated
    val currentEmployeeId = authState.user?.employeeId ?: "EMP-1082"

    LaunchedEffect(authState.isLoggedIn, currentEmployeeId) {
        if (authState.isLoggedIn) {
            attendanceViewModel.initialize(currentEmployeeId)
            entryViewModel.initialize(currentEmployeeId)
            financeViewModel.initialize(currentEmployeeId)
            profileViewModel.initialize()
        }
    }

    // Show feedback messages
    LaunchedEffect(attendanceState.message) {
        attendanceState.message?.let {
            scope.launch {
                snackbarHostState.showSnackbar(it)
                attendanceViewModel.clearFeedback()
            }
        }
    }

    LaunchedEffect(formState.submissionSuccessMessage) {
        formState.submissionSuccessMessage?.let {
            scope.launch {
                snackbarHostState.showSnackbar(it)
                entryViewModel.clearSubmissionFeedback()
            }
        }
    }

    val showBottomBar = authState.isLoggedIn &&
            currentRoute != Screen.Splash.route &&
            currentRoute != Screen.Login.route

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        currentRoute = if (route == Screen.CheckIn.route && attendanceState.activeAttendance != null) {
                            Screen.CheckOut.route
                        } else {
                            route
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentRoute) {
                Screen.Splash.route -> {
                    SplashScreen(
                        isLoggedIn = authState.isLoggedIn,
                        onNavigateNext = { isLoggedIn ->
                            currentRoute = if (isLoggedIn) Screen.Dashboard.route else Screen.Login.route
                        }
                    )
                }

                Screen.Login.route -> {
                    LoginScreen(
                        uiState = authState,
                        onIdentifierChanged = authViewModel::onIdentifierChanged,
                        onPasswordChanged = authViewModel::onPasswordChanged,
                        onTogglePasswordVisibility = authViewModel::togglePasswordVisibility,
                        onSelectDemoAccount = authViewModel::selectDemoAccount,
                        onLoginClick = {
                            authViewModel.login()
                        }
                    )

                    LaunchedEffect(authState.isLoggedIn) {
                        if (authState.isLoggedIn) {
                            currentRoute = Screen.Dashboard.route
                        }
                    }
                }

                Screen.Dashboard.route -> {
                    DashboardScreen(
                        user = authState.user,
                        financialSummary = financeState.summary,
                        activeAttendance = attendanceState.activeAttendance,
                        lastAttendance = attendanceState.lastAttendance,
                        elapsedShiftTime = attendanceState.elapsedShiftTime,
                        recentEntries = historyState.entries,
                        onNavigateToCheckIn = { currentRoute = Screen.CheckIn.route },
                        onNavigateToCheckOut = { currentRoute = Screen.CheckOut.route },
                        onNavigateToNewEntry = { currentRoute = Screen.DailyEntry.route },
                        onNavigateToEntryHistory = { currentRoute = Screen.EntryHistory.route },
                        onNavigateToFinanceHistory = { currentRoute = Screen.FinanceHistory.route }
                    )
                }

                Screen.CheckIn.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    CheckInScreen(
                        employeeId = currentEmployeeId,
                        uiState = attendanceState,
                        onPermissionResult = attendanceViewModel::onPermissionResult,
                        onRefreshLocation = attendanceViewModel::fetchCurrentLocation,
                        onCheckInClick = {
                            attendanceViewModel.checkIn(currentEmployeeId) {
                                currentRoute = Screen.Dashboard.route
                            }
                        },
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }

                Screen.CheckOut.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    CheckOutScreen(
                        employeeId = currentEmployeeId,
                        uiState = attendanceState,
                        onCheckOutClick = { remarks ->
                            attendanceViewModel.checkOut(currentEmployeeId, remarks) {
                                currentRoute = Screen.Dashboard.route
                            }
                        },
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }

                Screen.DailyEntry.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    DailyEntryScreen(
                        formState = formState,
                        onWebsiteChanged = entryViewModel::onWebsiteChanged,
                        onBankChanged = entryViewModel::onBankChanged,
                        onReferenceChanged = entryViewModel::onReferenceChanged,
                        onAmountChanged = entryViewModel::onAmountChanged,
                        onWithdrawalAmountChanged = entryViewModel::onWithdrawalAmountChanged,
                        onScreenshotSelected = entryViewModel::onScreenshotSelected,
                        onUseSampleScreenshot = entryViewModel::useSampleScreenshot,
                        onSubmitClick = {
                            entryViewModel.submitEntry(currentEmployeeId) {
                                currentRoute = Screen.EntryHistory.route
                            }
                        },
                        onClearFeedback = entryViewModel::clearSubmissionFeedback,
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }

                Screen.EntryHistory.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    EntryHistoryScreen(
                        employeeId = currentEmployeeId,
                        historyState = historyState,
                        onFilterChanged = entryViewModel::setHistoryFilter,
                        onCancelEntry = { entryId ->
                            entryViewModel.cancelPendingEntry(entryId, currentEmployeeId)
                        },
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }

                Screen.FinanceHistory.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    FinanceHistoryScreen(
                        financialSummary = financeState.summary,
                        transactions = financeState.transactions,
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }

                Screen.Profile.route -> {
                    BackHandler { currentRoute = Screen.Dashboard.route }
                    ProfileScreen(
                        uiState = profileState,
                        onUrlChanged = profileViewModel::onUrlChanged,
                        onSaveUrl = profileViewModel::saveBaseUrl,
                        onToggleEditUrl = profileViewModel::toggleEditUrl,
                        onTestConnection = profileViewModel::testBackendConnection,
                        onLogoutClick = {
                            authViewModel.logout()
                            currentRoute = Screen.Login.route
                        },
                        onNavigateBack = { currentRoute = Screen.Dashboard.route }
                    )
                }
            }
        }
    }
}
