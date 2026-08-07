package com.example.veldar.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * Ensures a maximum width for content on large screens (tablets/landscape).
 */
@Composable
fun AdaptiveWrapper(
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.TopCenter
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 600.dp) // Standard premium content width
                .fillMaxWidth(),
            content = content
        )
    }
}
