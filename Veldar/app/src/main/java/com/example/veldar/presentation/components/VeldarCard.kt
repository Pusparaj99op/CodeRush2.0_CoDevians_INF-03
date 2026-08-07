package com.example.veldar.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.example.veldar.presentation.theme.VeldarTheme
import com.example.veldar.utils.premiumGlass

@Composable
fun VeldarCard(
    modifier: Modifier = Modifier,
    alpha: Float = 0.08f,
    content: @Composable ColumnScope.() -> Unit
) {
    val theme = VeldarTheme
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.hugeShape, alpha = alpha),
        color = Color.Transparent,
        shape = theme.radius.hugeShape
    ) {
        Column(
            modifier = Modifier.padding(theme.spacing.large),
            content = content
        )
    }
}
