package com.example.ui.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Dashboard : Screen("dashboard")
    object CheckIn : Screen("check_in")
    object CheckOut : Screen("check_out")
    object DailyEntry : Screen("daily_entry")
    object EntryHistory : Screen("entry_history")
    object FinanceHistory : Screen("finance_history")
    object Profile : Screen("profile")
}
