package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = TealPrimary,
    onPrimary = CleanWhite,
    primaryContainer = Color(0xFFCCFBF1),
    onPrimaryContainer = Color(0xFF115E59),
    secondary = TealPrimaryDark,
    onSecondary = CleanWhite,
    secondaryContainer = Color(0xFFE2E8F0),
    onSecondaryContainer = NavyDark,
    tertiary = EmeraldAccent,
    onTertiary = CleanWhite,
    background = SurfaceLight,
    onBackground = NavyDark,
    surface = SurfaceCard,
    onSurface = NavyDark,
    surfaceVariant = SurfaceVariant,
    onSurfaceVariant = NavyLight,
    outline = BorderLight,
    outlineVariant = SlateSubtle,
    error = Color(0xFFDC2626),
    onError = CleanWhite
)

private val DarkColorScheme = darkColorScheme(
    primary = TealPrimaryLight,
    onPrimary = NavyDark,
    primaryContainer = TealPrimaryDark,
    onPrimaryContainer = Color(0xFFCCFBF1),
    secondary = Color(0xFF5EEAD4),
    onSecondary = NavyDark,
    tertiary = EmeraldAccent,
    background = DarkBackground,
    onBackground = CleanWhite,
    surface = DarkSurface,
    onSurface = CleanWhite,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = Color(0xFFCBD5E1),
    outline = Color(0xFF334155),
    error = Color(0xFFEF4444)
)

@Composable
fun WorkLedgerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
