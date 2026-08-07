package com.example.veldar.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.veldar.presentation.theme.*

@Composable
fun StateWrapper(
    isLoading: Boolean,
    error: String? = null,
    isEmpty: Boolean = false,
    emptyMessage: String = "No data found",
    onRetry: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val theme = VeldarTheme
    
    Box(modifier = Modifier.fillMaxSize()) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center),
                color = Primary
            )
        } else if (error != null) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = error, color = Error, style = Typography.bodyLarge)
                if (onRetry != null) {
                    Spacer(modifier = Modifier.height(theme.spacing.medium))
                    VeldarButton(text = "Retry", onClick = onRetry, modifier = Modifier.width(120.dp))
                }
            }
        } else if (isEmpty) {
            Text(
                text = emptyMessage,
                modifier = Modifier.align(Alignment.Center),
                color = White.copy(alpha = 0.5f),
                style = Typography.bodyLarge
            )
        } else {
            content()
        }
    }
}
