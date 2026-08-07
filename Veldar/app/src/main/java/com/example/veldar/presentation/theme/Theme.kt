package com.example.veldar.presentation.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    secondary = Secondary,
    tertiary = Accent,
    background = Background,
    surface = Surface,
    onPrimary = White,
    onSecondary = White,
    onTertiary = White,
    onBackground = White,
    onSurface = White,
    error = Error,
    outline = Border,
    surfaceVariant = CardBackground
)

object VeldarTheme {
    val spacing: VeldarSpacing
        @Composable
        @ReadOnlyComposable
        get() = LocalSpacing.current

    val radius: VeldarRadius
        @Composable
        @ReadOnlyComposable
        get() = LocalRadius.current

    val elevation: VeldarElevation
        @Composable
        @ReadOnlyComposable
        get() = LocalElevation.current

    val animation: VeldarAnimation
        @Composable
        @ReadOnlyComposable
        get() = LocalAnimation.current

    val gradients: VeldarGradients
        @Composable
        @ReadOnlyComposable
        get() = LocalGradients.current

    val icons: VeldarIcons
        @Composable
        @ReadOnlyComposable
        get() = LocalIcons.current
}

@Composable
fun VeldarTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }

    CompositionLocalProvider(
        LocalSpacing provides VeldarSpacing(),
        LocalRadius provides VeldarRadius(),
        LocalElevation provides VeldarElevation(),
        LocalAnimation provides VeldarAnimation(),
        LocalGradients provides VeldarGradients(),
        LocalIcons provides VeldarIcons()
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            content = content
        )
    }
}
