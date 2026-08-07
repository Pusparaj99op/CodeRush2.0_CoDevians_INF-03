package com.example.veldar.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.StaggeredAnimatedVisibility
import com.example.veldar.presentation.components.VeldarButton
import com.example.veldar.presentation.components.VeldarCard
import com.example.veldar.presentation.screens.dashboard.BottomNavigationBar
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.ProfileViewModel
import com.example.veldar.utils.premiumGlass

import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.rememberNavController

@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = hiltViewModel()
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = theme.spacing.screenPadding)
        ) {
            item {
                Spacer(modifier = Modifier.height(theme.spacing.extraLarge))
                Text(
                    text = "Profile",
                    color = White,
                    style = Typography.displayMedium
                )
                Spacer(modifier = Modifier.height(theme.spacing.large))
                
                StaggeredAnimatedVisibility(0) {
                    VeldarCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .background(Primary.copy(alpha = 0.1f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = uiState.userName.take(1),
                                    color = Primary,
                                    style = Typography.displayMedium
                                )
                            }
                            Spacer(modifier = Modifier.width(theme.spacing.medium))
                            Column {
                                Text(text = uiState.userName, color = White, style = Typography.titleLarge)
                                Text(text = uiState.userEmail, color = White.copy(alpha = 0.4f), style = Typography.bodyMedium)
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(theme.spacing.large))
                
                StaggeredAnimatedVisibility(1) {
                    Column {
                        Text(text = "Settings", color = White, style = Typography.titleMedium, modifier = Modifier.padding(bottom = theme.spacing.medium))
                        
                        ProfileItem(
                            icon = theme.icons.notifications,
                            title = "Notifications",
                            trailing = {
                                Switch(
                                    checked = uiState.notificationsEnabled,
                                    onCheckedChange = { viewModel.toggleNotifications() },
                                    colors = SwitchDefaults.colors(checkedThumbColor = Primary)
                                )
                            }
                        )
                        
                        Spacer(modifier = Modifier.height(theme.spacing.itemSpacing))
                        
                        ProfileItem(
                            icon = theme.icons.security,
                            title = "Security & Privacy",
                            onClick = { }
                        )
                        
                        Spacer(modifier = Modifier.height(theme.spacing.itemSpacing))
                        
                        ProfileItem(
                            icon = theme.icons.person,
                            title = "Subscription Plan",
                            subtitle = uiState.plan,
                            onClick = { }
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(theme.spacing.huge))
                
                StaggeredAnimatedVisibility(2) {
                    VeldarButton(
                        text = "Logout",
                        onClick = { viewModel.logout() },
                        isSecondary = true
                    )
                }
                
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun ProfileScreenPreview() {
    VeldarTheme {
        ProfileScreen(rememberNavController())
    }
}

@Composable
fun ProfileItem(
    icon: ImageVector,
    title: String,
    subtitle: String? = null,
    onClick: (() -> Unit)? = null,
    trailing: @Composable (() -> Unit)? = null
) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.largeShape, alpha = 0.04f)
            .clip(theme.radius.largeShape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(theme.spacing.medium)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = icon, contentDescription = null, tint = White.copy(alpha = 0.5f), modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(theme.spacing.medium))
                Column {
                    Text(text = title, color = White, style = Typography.bodyLarge)
                    if (subtitle != null) {
                        Text(text = subtitle, color = White.copy(alpha = 0.4f), style = Typography.bodyMedium)
                    }
                }
            }
            
            if (trailing != null) {
                trailing()
            } else if (onClick != null) {
                Icon(imageVector = theme.icons.chevronRight, contentDescription = null, tint = White.copy(alpha = 0.2f))
            }
        }
    }
}
