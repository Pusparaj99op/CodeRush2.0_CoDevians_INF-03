package com.example.veldar.presentation.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.viewmodels.SplashViewModel
import com.example.veldar.presentation.theme.*

import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.rememberNavController

@Composable
fun SplashScreen(
    navController: NavController,
    viewModel: SplashViewModel = hiltViewModel()
) {
    val theme = VeldarTheme
    val scale = remember { Animatable(0.7f) }
    val alpha = remember { Animatable(0f) }
    
    val springSpec = theme.animation.springBouncy
    val verySlowTween = theme.animation.verySlow

    NavigationEventHandler(navController, viewModel.navigationEvent)

    LaunchedEffect(Unit) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = springSpec
        )
        alpha.animateTo(1f, animationSpec = tween(verySlowTween, easing = EaseInOutQuart))
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
        contentAlignment = Alignment.Center
    ) {
        val infiniteTransition = rememberInfiniteTransition(label = "glow")
        val glowScale by infiniteTransition.animateFloat(
            initialValue = 1f,
            targetValue = 1.3f,
            animationSpec = infiniteRepeatable(
                animation = tween(4000, easing = EaseInOutSine),
                repeatMode = RepeatMode.Reverse
            ),
            label = "glow_scale"
        )

        Box(
            modifier = Modifier
                .size(400.dp)
                .scale(glowScale)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(Primary.copy(alpha = 0.12f), Color.Transparent)
                    )
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.scale(scale.value)
        ) {
            Box(
                modifier = Modifier
                    .size(112.dp)
                    .background(
                        brush = theme.gradients.brandBrush,
                        shape = theme.radius.extraLargeShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "V",
                    color = White,
                    style = Typography.displayLarge,
                    fontSize = 56.sp
                )
            }

            Spacer(modifier = Modifier.height(theme.spacing.extraLarge))

            Text(
                text = "VELDAR",
                color = White.copy(alpha = alpha.value),
                style = Typography.displayMedium,
                letterSpacing = 10.sp
            )
            
            Text(
                text = "PREMIUM AI PLATFORM",
                color = White.copy(alpha = alpha.value * 0.4f),
                style = Typography.labelMedium,
                letterSpacing = 4.sp,
                modifier = Modifier.padding(top = theme.spacing.small)
            )
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun SplashScreenPreview() {
    VeldarTheme {
        SplashScreen(rememberNavController())
    }
}
