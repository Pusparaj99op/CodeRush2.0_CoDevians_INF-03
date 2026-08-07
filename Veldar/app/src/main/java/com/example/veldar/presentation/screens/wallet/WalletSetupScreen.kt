package com.example.veldar.presentation.screens.wallet

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
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
import com.example.veldar.presentation.viewmodels.WalletViewModel
import com.example.veldar.utils.premiumGlass

@Composable
fun WalletSetupScreen(
    navController: NavController,
    viewModel: WalletViewModel = hiltViewModel()
) {
    val theme = VeldarTheme
    
    NavigationEventHandler(navController, viewModel.navigationEvent)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .padding(theme.spacing.screenPadding)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.Start
        ) {
            Spacer(modifier = Modifier.height(theme.spacing.huge))
            
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(Primary.copy(alpha = 0.1f), theme.radius.largeShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = theme.icons.security,
                    contentDescription = null,
                    modifier = Modifier.size(28.dp),
                    tint = Primary
                )
            }
            
            Spacer(modifier = Modifier.height(theme.spacing.large))
            
            Text(
                text = "Secure your assets",
                color = White,
                style = Typography.displayMedium
            )
            
            Text(
                text = "Veldar uses institutional-grade encryption to protect your digital identity.",
                color = White.copy(alpha = 0.5f),
                style = Typography.bodyLarge,
                modifier = Modifier.padding(top = theme.spacing.small)
            )

            Spacer(modifier = Modifier.height(theme.spacing.huge))

            WalletOptionCard(
                title = "Create new wallet",
                subtitle = "Generate a new 24-word recovery phrase",
                icon = theme.icons.add,
                onClick = { /* ViewModel logic */ }
            )

            Spacer(modifier = Modifier.height(theme.spacing.medium))

            WalletOptionCard(
                title = "Import existing wallet",
                subtitle = "Use your existing seed phrase from Metamask or Ledger",
                icon = theme.icons.upload,
                onClick = { /* ViewModel logic */ }
            )

            Spacer(modifier = Modifier.weight(1f))

            VeldarCard(alpha = 0.04f) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = theme.icons.verified,
                        contentDescription = null,
                        tint = Success,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(theme.spacing.itemSpacing))
                    Text(
                        text = "Your private keys never leave this device.",
                        color = White.copy(alpha = 0.5f),
                        style = Typography.labelMedium
                    )
                }
            }

            Spacer(modifier = Modifier.height(theme.spacing.large))

            VeldarButton(
                text = "Proceed to Subscription",
                onClick = {
                    viewModel.onProceedClicked()
                }
            )
        }
    }
}

@Composable
fun WalletOptionCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    val theme = VeldarTheme
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1f,
        animationSpec = theme.animation.springResponsive,
        label = "card_scale"
    )

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .premiumGlass(theme.radius.hugeShape, alpha = 0.06f)
            .clip(theme.radius.hugeShape)
            .clickable(
                interactionSource = interactionSource,
                indication = ripple(),
                onClick = onClick
            )
            .padding(theme.spacing.cardPadding)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .background(White.copy(alpha = 0.05f), theme.radius.mediumShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = White)
            }
            
            Spacer(modifier = Modifier.width(theme.spacing.medium))
            
            Column {
                Text(
                    text = title,
                    color = White,
                    style = Typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = subtitle,
                    color = White.copy(alpha = 0.4f),
                    style = Typography.bodyMedium
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun WalletSetupScreenPreview() {
    VeldarTheme {
        WalletSetupScreen(rememberNavController())
    }
}
