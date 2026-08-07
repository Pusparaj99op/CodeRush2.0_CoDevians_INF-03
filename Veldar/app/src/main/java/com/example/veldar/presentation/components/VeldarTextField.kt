package com.example.veldar.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.unit.dp
import com.example.veldar.presentation.theme.*

/**
 * Premium, high-fidelity input field inspired by Linear.
 */
@Composable
fun VeldarTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    label: String? = null,
    singleLine: Boolean = true,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default
) {
    val theme = VeldarTheme
    
    Column(modifier = modifier) {
        if (label != null) {
            Text(
                text = label,
                style = Typography.labelMedium,
                color = White.copy(alpha = 0.5f),
                modifier = Modifier.padding(bottom = theme.spacing.small)
            )
        }
        
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp)
                .background(White.copy(alpha = 0.03f), theme.radius.largeShape)
                .border(1.dp, White.copy(alpha = 0.06f), theme.radius.largeShape)
                .padding(horizontal = theme.spacing.medium),
            contentAlignment = Alignment.CenterStart
        ) {
            if (value.isEmpty()) {
                Text(
                    text = placeholder,
                    style = Typography.bodyLarge,
                    color = White.copy(alpha = 0.2f)
                )
            }
            
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                textStyle = Typography.bodyLarge.copy(color = White),
                cursorBrush = SolidColor(Primary),
                singleLine = singleLine,
                keyboardOptions = keyboardOptions,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
