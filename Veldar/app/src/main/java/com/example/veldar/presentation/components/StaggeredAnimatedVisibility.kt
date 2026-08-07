package com.example.veldar.presentation.components

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.example.veldar.presentation.theme.VeldarTheme

@Composable
fun StaggeredAnimatedVisibility(
    index: Int,
    content: @Composable () -> Unit
) {
    var visible by remember { mutableStateOf(false) }
    val theme = VeldarTheme

    LaunchedEffect(Unit) {
        kotlinx.coroutines.delay(index * 100L)
        visible = true
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn(tween(theme.animation.normal)) + 
                slideInVertically(
                    initialOffsetY = { 20 },
                    animationSpec = theme.animation.entranceTransition
                )
    ) {
        content()
    }
}
