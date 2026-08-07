package com.example.veldar.presentation.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.veldar.presentation.theme.*

@Composable
fun VeldarButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isSecondary: Boolean = false
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    
    val theme = VeldarTheme
    
    // Tactile Scale Animation
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = theme.animation.springResponsive,
        label = "button_scale"
    )

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .fillMaxWidth()
            .height(56.dp)
            .clip(theme.radius.largeShape)
            .background(
                brush = if (!isSecondary) theme.gradients.primaryBrush
                        else Brush.horizontalGradient(theme.gradients.glass),
                alpha = if (enabled) 1f else 0.5f
            )
            .clickable(
                enabled = enabled,
                onClick = onClick,
                interactionSource = interactionSource,
                indication = ripple()
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = if (!isSecondary) White else White.copy(alpha = 0.8f),
            style = Typography.titleMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}
