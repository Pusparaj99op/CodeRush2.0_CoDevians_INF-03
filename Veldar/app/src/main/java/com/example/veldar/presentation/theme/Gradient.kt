package com.example.veldar.presentation.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

@Immutable
data class VeldarGradients(
    val primary: List<Color> = listOf(Primary, Color(0xFFEA580C)),
    val brand: List<Color> = listOf(Primary, Color(0xFFF43F5E), Color(0xFF6366F1)),
    val glass: List<Color> = listOf(
        Color.White.copy(alpha = 0.08f),
        Color.White.copy(alpha = 0.02f)
    ),
    val card: List<Color> = listOf(
        Color(0xFF1C1C1C),
        Color(0xFF121212)
    ),
    val mesh: List<Color> = listOf(
        Color(0xFF1E1E1E),
        Color(0xFF000000)
    ),
    val surface: List<Color> = listOf(
        Color.White.copy(alpha = 0.05f),
        Color.Transparent
    )
) {
    val primaryBrush = Brush.horizontalGradient(primary)
    val brandBrush = Brush.linearGradient(brand)
    val meshBrush = Brush.verticalGradient(mesh)
}

val LocalGradients = staticCompositionLocalOf { VeldarGradients() }
