package com.example.veldar.presentation.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class VeldarElevation(
    val none: Dp = 0.dp,
    val level1: Dp = 2.dp,
    val level2: Dp = 4.dp,
    val level3: Dp = 8.dp,
    val level4: Dp = 12.dp,
    val level5: Dp = 24.dp
)

val LocalElevation = staticCompositionLocalOf { VeldarElevation() }
