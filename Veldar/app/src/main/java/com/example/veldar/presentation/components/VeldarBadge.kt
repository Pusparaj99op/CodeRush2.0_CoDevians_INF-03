package com.example.veldar.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.veldar.presentation.theme.*

/**
 * High-contrast badges with soft glows for status indications.
 */
@Composable
fun VeldarBadge(
    text: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    val theme = VeldarTheme
    Text(
        text = text.uppercase(),
        style = Typography.labelMedium,
        color = color,
        modifier = modifier
            .background(color.copy(alpha = 0.1f), theme.radius.capsule)
            .padding(horizontal = theme.spacing.small, vertical = theme.spacing.extraSmall)
    )
}
