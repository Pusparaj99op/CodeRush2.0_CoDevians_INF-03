package com.example.veldar.utils

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Flagship Glassmorphism effect with specular highlights and optical depth.
 */
fun Modifier.premiumGlass(
    shape: Shape,
    borderWidth: Dp = 1.dp,
    alpha: Float = 0.08f,
    showInnerGlow: Boolean = true
): Modifier = this
    .graphicsLayer(compositingStrategy = androidx.compose.ui.graphics.CompositingStrategy.Offscreen)
    .background(
        brush = Brush.verticalGradient(
            colors = listOf(
                Color.White.copy(alpha = alpha),
                Color.White.copy(alpha = alpha * 0.2f) // More falloff for premium depth
            )
        ),
        shape = shape
    )
    .border(
        width = borderWidth,
        brush = Brush.verticalGradient(
            colors = listOf(
                Color.White.copy(alpha = 0.15f), // Specular highlight at top
                Color.White.copy(alpha = 0.02f)  // Soft shadow at bottom
            )
        ),
        shape = shape
    )
    .then(
        if (showInnerGlow) {
            Modifier.drawWithContent {
                drawContent()
                // Linear-inspired Specular Highlight (Rim Light)
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.04f),
                            Color.Transparent
                        ),
                        startY = 0f,
                        endY = size.height * 0.2f
                    ),
                    blendMode = BlendMode.Screen
                )
            }
        } else Modifier
    )
