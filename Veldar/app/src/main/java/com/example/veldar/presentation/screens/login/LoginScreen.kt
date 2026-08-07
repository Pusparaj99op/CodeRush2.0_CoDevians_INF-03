package com.example.veldar.presentation.screens.login

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.VeldarButton
import com.example.veldar.presentation.components.VeldarCard
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.LoginViewModel

@Composable
fun LoginScreen(
    navController: NavController,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val theme = VeldarTheme
    var visible by remember { mutableStateOf(false) }
    
    NavigationEventHandler(navController, viewModel.navigationEvent)

    LaunchedEffect(Unit) {
        visible = true
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .fillMaxWidth()
                .height(500.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(Primary.copy(alpha = 0.15f), Color.Transparent)
                    )
                )
        )

        AnimatedVisibility(
            visible = visible,
            enter = fadeIn() + slideInVertically(initialOffsetY = { 40 })
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(theme.spacing.screenPadding),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(
                            brush = theme.gradients.primaryBrush,
                            shape = theme.radius.hugeShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "V", 
                        color = White, 
                        style = Typography.displayMedium,
                        fontSize = 40.sp
                    )
                }

                Spacer(modifier = Modifier.height(theme.spacing.extraLarge))

                Text(
                    text = "Welcome to Veldar",
                    color = White,
                    style = Typography.displayMedium,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "The future of AI-driven workflow orchestration, wrapped in pure elegance.",
                    color = White.copy(alpha = 0.5f),
                    style = Typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = theme.spacing.medium)
                )

                Spacer(modifier = Modifier.height(theme.spacing.huge))

                VeldarCard {
                    Text(
                        text = "Authentication",
                        color = White,
                        style = Typography.titleLarge,
                        modifier = Modifier.padding(bottom = theme.spacing.small)
                    )
                    
                    Text(
                        text = "Choose your preferred method to continue.",
                        color = White.copy(alpha = 0.4f),
                        style = Typography.bodyMedium,
                        modifier = Modifier.padding(bottom = theme.spacing.large)
                    )

                    VeldarButton(
                        text = "Continue with Google",
                        onClick = {
                            viewModel.onGoogleLoginClicked()
                        }
                    )
                    
                    Spacer(modifier = Modifier.height(theme.spacing.medium))
                    
                    VeldarButton(
                        text = "Use Email Address",
                        isSecondary = true,
                        onClick = { /* ViewModel logic */ }
                    )
                }

                Spacer(modifier = Modifier.height(theme.spacing.extraLarge))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    FooterLink("Terms of Service")
                    Text(
                        text = "•",
                        color = White.copy(alpha = 0.2f),
                        modifier = Modifier.padding(horizontal = theme.spacing.small)
                    )
                    FooterLink("Privacy Policy")
                }
            }
        }
    }
}

@Composable
fun FooterLink(text: String) {
    Text(
        text = text,
        color = White.copy(alpha = 0.3f),
        style = Typography.labelMedium
    )
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun LoginScreenPreview() {
    VeldarTheme {
        LoginScreen(rememberNavController())
    }
}
