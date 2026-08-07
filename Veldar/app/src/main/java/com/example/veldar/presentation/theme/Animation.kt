package com.example.veldar.presentation.theme

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.ui.unit.IntOffset
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf

@Immutable
data class VeldarAnimation(
    // Durations
    val fast: Int = 200,
    val normal: Int = 400,
    val slow: Int = 700,
    val verySlow: Int = 1000,
    
    // Spring Specs - Physics based for tactile feel
    val springResponsive: SpringSpec<Float> = spring(
        dampingRatio = Spring.DampingRatioLowBouncy,
        stiffness = Spring.StiffnessLow
    ),
    
    val springBouncy: SpringSpec<Float> = spring(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessVeryLow
    ),

    val springTight: SpringSpec<Float> = spring(
        dampingRatio = Spring.DampingRatioNoBouncy,
        stiffness = Spring.StiffnessHigh
    ),
    
    // Transition Specs
    val entranceTransition: SpringSpec<IntOffset> = spring(
        stiffness = Spring.StiffnessLow,
        dampingRatio = Spring.DampingRatioLowBouncy
    ),
    
    val sharedElementEase: Easing = CubicBezierEasing(0.4f, 0f, 0.2f, 1f),
    
    val fadeTween: TweenSpec<Float> = tween(durationMillis = 400, easing = LinearOutSlowInEasing)
)

val LocalAnimation = staticCompositionLocalOf { VeldarAnimation() }
