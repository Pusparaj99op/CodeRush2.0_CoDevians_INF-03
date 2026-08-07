package com.example.veldar.presentation.screens.wallet

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.components.*
import com.example.veldar.presentation.screens.dashboard.BottomNavigationBar
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.WalletViewModel

@Composable
fun WalletOverviewScreen(
    navController: NavController,
    viewModel: WalletViewModel = hiltViewModel()
) {
    val theme = VeldarTheme
    val uiState by viewModel.uiState.collectAsState()
    
    NavigationEventHandler(navController, viewModel.navigationEvent)

    Scaffold(
        containerColor = Background,
        bottomBar = {
            BottomNavigationBar(navController)
        }
    ) { paddingValues ->
        AdaptiveWrapper(
            modifier = Modifier.padding(paddingValues)
        ) {
            StateWrapper(
                isLoading = uiState.isLoading,
                error = uiState.error,
                isEmpty = uiState.wallet == null,
                emptyMessage = "No wallet found",
                onRetry = { viewModel.loadWallet() }
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = theme.spacing.screenPadding)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(theme.spacing.huge))
                        Text(
                            text = "My Wallet",
                            color = White,
                            style = Typography.displayMedium
                        )
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                    }
                    
                    item {
                        uiState.wallet?.let { wallet ->
                            StaggeredAnimatedVisibility(0) {
                                VeldarCard {
                                    Column {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(text = wallet.name, color = White.copy(alpha = 0.6f), style = Typography.labelMedium)
                                            VeldarBadge(text = wallet.type, color = Primary)
                                        }
                                        Text(
                                            text = wallet.balance, 
                                            color = White, 
                                            style = Typography.displayMedium,
                                            modifier = Modifier.padding(vertical = theme.spacing.small)
                                        )
                                        Spacer(modifier = Modifier.height(theme.spacing.medium))
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .background(White.copy(alpha = 0.05f), theme.radius.mediumShape)
                                                .padding(theme.spacing.medium)
                                        ) {
                                            Text(
                                                text = wallet.address, 
                                                color = White.copy(alpha = 0.4f), 
                                                style = Typography.bodyMedium,
                                                letterSpacing = 1.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    item {
                        Spacer(modifier = Modifier.height(theme.spacing.extraLarge))
                        StaggeredAnimatedVisibility(1) {
                            Text(text = "Quick Actions", color = White, style = Typography.titleLarge, modifier = Modifier.padding(bottom = theme.spacing.medium))
                        }
                    }
                    
                    item {
                        StaggeredAnimatedVisibility(2) {
                            Row(modifier = Modifier.fillMaxWidth()) {
                                ActionButton(icon = theme.icons.add, label = "Top Up", modifier = Modifier.weight(1f))
                                Spacer(modifier = Modifier.width(theme.spacing.medium))
                                ActionButton(icon = theme.icons.upload, label = "Send", modifier = Modifier.weight(1f))
                            }
                        }
                    }

                    item {
                        Spacer(modifier = Modifier.height(140.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ActionButton(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, modifier: Modifier = Modifier) {
    val theme = VeldarTheme
    Column(
        modifier = modifier
            .background(White.copy(alpha = 0.03f), theme.radius.largeShape)
            .padding(theme.spacing.medium),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(imageVector = icon, contentDescription = null, tint = White, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.height(theme.spacing.small))
        Text(text = label, color = White.copy(alpha = 0.6f), style = Typography.labelMedium)
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun WalletOverviewScreenPreview() {
    VeldarTheme {
        WalletOverviewScreen(rememberNavController())
    }
}
