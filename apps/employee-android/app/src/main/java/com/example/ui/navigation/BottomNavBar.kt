package com.example.ui.navigation

import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PostAdd
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.NavyDark
import com.example.ui.theme.NavyLight
import com.example.ui.theme.SlateMuted
import com.example.ui.theme.TealPrimary

data class NavItem(
    val title: String,
    val icon: ImageVector,
    val route: String,
    val tag: String
)

@Composable
fun BottomNavBar(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val items = listOf(
        NavItem("Home", Icons.Default.Dashboard, Screen.Dashboard.route, "nav_home"),
        NavItem("Shift", Icons.Default.Schedule, Screen.CheckIn.route, "nav_shift"),
        NavItem("New Entry", Icons.Default.PostAdd, Screen.DailyEntry.route, "nav_new_entry"),
        NavItem("Ledger", Icons.Default.AccountBalanceWallet, Screen.FinanceHistory.route, "nav_ledger"),
        NavItem("Profile", Icons.Default.Person, Screen.Profile.route, "nav_profile")
    )

    NavigationBar(
        modifier = modifier.windowInsetsPadding(WindowInsets.navigationBars),
        containerColor = Color.White,
        tonalElevation = 6.dp
    ) {
        items.forEach { item ->
            val isSelected = currentRoute == item.route ||
                    (item.route == Screen.CheckIn.route && (currentRoute == Screen.CheckIn.route || currentRoute == Screen.CheckOut.route))

            NavigationBarItem(
                selected = isSelected,
                onClick = { onNavigate(item.route) },
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.title,
                        modifier = Modifier.size(22.dp)
                    )
                },
                label = {
                    Text(
                        text = item.title,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                    )
                },
                modifier = Modifier.testTag(item.tag),
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = TealPrimary,
                    selectedTextColor = TealPrimary,
                    indicatorColor = Color(0xFFCCFBF1),
                    unselectedIconColor = SlateMuted,
                    unselectedTextColor = SlateMuted
                )
            )
        }
    }
}
