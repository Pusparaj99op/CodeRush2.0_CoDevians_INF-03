package com.example.veldar.presentation.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class VeldarRadius(
    val none: Dp = 0.dp,
    val small: Dp = 8.dp,
    val medium: Dp = 12.dp,
    val large: Dp = 16.dp,
    val extraLarge: Dp = 20.dp,
    val huge: Dp = 24.dp,
    val max: Dp = 100.dp
) {
    val smallShape = RoundedCornerShape(small)
    val mediumShape = RoundedCornerShape(medium)
    val largeShape = RoundedCornerShape(large)
    val extraLargeShape = RoundedCornerShape(extraLarge)
    val hugeShape = RoundedCornerShape(huge)
    val capsule = RoundedCornerShape(max)
}

val LocalRadius = staticCompositionLocalOf { VeldarRadius() }
