package com.example.veldar.presentation.screens.dashboard

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.domain.model.Workflow
import com.example.veldar.presentation.components.AdaptiveWrapper
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.StaggeredAnimatedVisibility
import com.example.veldar.presentation.components.StateWrapper
import com.example.veldar.presentation.navigation.Screen
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.DashboardViewModel
import com.example.veldar.utils.premiumGlass

@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val theme = VeldarTheme
    val uiState by viewModel.uiState.collectAsState()
    
    NavigationEventHandler(navController, viewModel.navigationEvent)

    Scaffold(
        containerColor = Background,
        bottomBar = {
            BottomNavigationBar(navController)
        },
        floatingActionButton = {
            val fabScale by animateFloatAsState(
                targetValue = 1f,
                animationSpec = theme.animation.springBouncy,
                label = "fab_scale"
            )
            
            FloatingActionButton(
                onClick = { navController.navigate(Screen.CreateWorkflow.route) },
                containerColor = Primary,
                contentColor = White,
                shape = CircleShape,
                modifier = Modifier
                    .size(64.dp)
                    .offset(y = 44.dp)
                    .graphicsLayer {
                        scaleX = fabScale
                        scaleY = fabScale
                    }
            ) {
                Icon(
                    imageVector = theme.icons.add, 
                    contentDescription = "Add", 
                    modifier = Modifier.size(32.dp)
                )
            }
        },
        floatingActionButtonPosition = FabPosition.Center
    ) { paddingValues ->
        AdaptiveWrapper(
            modifier = Modifier.padding(paddingValues)
        ) {
            StateWrapper(
                isLoading = uiState.isLoading,
                error = uiState.error,
                onRetry = { viewModel.loadDashboardData() }
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = theme.spacing.screenPadding)
                ) {
                    item(key = "dashboard_header") {
                        Spacer(modifier = Modifier.height(theme.spacing.huge))
                        StaggeredAnimatedVisibility(0) { Header() }
                        Spacer(modifier = Modifier.height(theme.spacing.extraLarge))
                        StaggeredAnimatedVisibility(1) { UserCard(uiState.balance) }
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                        StaggeredAnimatedVisibility(2) { BudgetCard(uiState.budgetProgress) }
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                        StaggeredAnimatedVisibility(3) { SpendingGraphPlaceholder() }
                        Spacer(modifier = Modifier.height(theme.spacing.extraLarge))
                        Text(
                            text = "Active Workflows",
                            color = White,
                            style = Typography.titleLarge,
                            modifier = Modifier.padding(bottom = theme.spacing.medium)
                        )
                    }
                    
                    itemsIndexed(
                        items = uiState.recentWorkflows,
                        key = { _, item -> item.id }
                    ) { index, workflow ->
                        StaggeredAnimatedVisibility(index + 4) {
                            WorkflowItem(workflow)
                        }
                        Spacer(modifier = Modifier.height(theme.spacing.itemSpacing))
                    }
                    
                    item(key = "footer_spacer") {
                        Spacer(modifier = Modifier.height(140.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun Header() {
    val theme = VeldarTheme
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = "Good morning,",
                color = White.copy(alpha = 0.5f),
                style = Typography.titleMedium
            )
            Text(
                text = "Alexander",
                color = White,
                style = Typography.displayMedium
            )
        }
        
        Box(
            modifier = Modifier
                .size(52.dp)
                .background(Color.Transparent)
                .premiumGlass(CircleShape, alpha = 0.1f),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = theme.icons.notifications, contentDescription = "Notifications", tint = White)
        }
    }
}

@Composable
fun UserCard(balance: String) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(220.dp)
            .clip(theme.radius.hugeShape)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(Primary, Color(0xFFD64D15), Accent)
                )
            )
            .padding(theme.spacing.large)
    ) {
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    text = "PROMAX MEMBER", 
                    color = White.copy(alpha = 0.8f), 
                    style = Typography.labelMedium,
                    letterSpacing = 2.sp
                )
                Icon(imageVector = theme.icons.autoAwesome, contentDescription = null, tint = White)
            }
            
            Column {
                Text(text = "Total Balance", color = White.copy(alpha = 0.8f), style = Typography.bodyMedium)
                Text(text = balance, color = White, style = Typography.displayLarge)
            }
            
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "**** 4829", color = White.copy(alpha = 0.6f), style = Typography.bodyMedium)
                Spacer(modifier = Modifier.weight(1f))
                Text(text = "08/29", color = White.copy(alpha = 0.6f), style = Typography.labelMedium)
            }
        }
    }
}

@Composable
fun BudgetCard(budgetProgress: Float) {
    val theme = VeldarTheme
    var progress by remember { mutableFloatStateOf(0f) }
    
    val percentageText by remember(progress) {
        derivedStateOf { "${(progress * 100).toInt()}%" }
    }
    
    val progressAnimSpec = theme.animation.springResponsive
    
    LaunchedEffect(budgetProgress) {
        animate(
            initialValue = 0f,
            targetValue = budgetProgress,
            animationSpec = progressAnimSpec
        ) { value, _ -> progress = value }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.hugeShape, alpha = 0.05f)
            .padding(theme.spacing.cardPadding)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Primary.copy(alpha = 0.1f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = theme.icons.trendingUp, contentDescription = null, tint = Primary)
            }
            
            Spacer(modifier = Modifier.width(theme.spacing.medium))
            
            Column {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Monthly Budget", color = White, style = Typography.titleMedium)
                    Text(text = percentageText, color = Primary, style = Typography.labelMedium)
                }
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = theme.spacing.small)
                        .height(8.dp)
                        .clip(CircleShape),
                    color = Primary,
                    trackColor = White.copy(alpha = 0.05f),
                    strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
                )
            }
        }
    }
}

@Composable
fun SpendingGraphPlaceholder() {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(160.dp)
            .premiumGlass(theme.radius.hugeShape, alpha = 0.04f)
            .padding(theme.spacing.cardPadding)
    ) {
        Column {
            Text(text = "Monthly Spending", color = White.copy(alpha = 0.6f), style = Typography.labelMedium)
            Spacer(modifier = Modifier.weight(1f))
            Row(
                modifier = Modifier.fillMaxWidth().height(80.dp),
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                val heights = listOf(0.4f, 0.7f, 0.5f, 0.9f, 0.6f, 0.8f, 0.4f)
                heights.forEach { h ->
                    Box(
                        modifier = Modifier
                            .width(14.dp) // Optimized width
                            .fillMaxHeight(h)
                            .background(Primary.copy(alpha = 0.4f), theme.radius.smallShape)
                    )
                }
            }
        }
    }
}

@Composable
fun WorkflowItem(workflow: Workflow) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.hugeShape, alpha = 0.04f)
            .clip(theme.radius.hugeShape)
            .clickable { }
            .padding(theme.spacing.cardPadding)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(White.copy(alpha = 0.05f), theme.radius.mediumShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = theme.icons.bolt, contentDescription = null, tint = White.copy(alpha = 0.6f))
            }
            Spacer(modifier = Modifier.width(theme.spacing.medium))
            Column {
                Text(text = workflow.title, color = White, style = Typography.titleMedium)
                Text(text = workflow.description, color = White.copy(alpha = 0.4f), style = Typography.bodyMedium)
            }
            Spacer(modifier = Modifier.weight(1f))
            Icon(imageVector = theme.icons.chevronRight, contentDescription = null, tint = White.copy(alpha = 0.2f))
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavController) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(100.dp)
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(Color.Transparent, Background.copy(alpha = 0.95f))
                )
            )
            .padding(horizontal = 24.dp, vertical = 12.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .premiumGlass(theme.radius.hugeShape, alpha = 0.15f)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                BottomNavItem(theme.icons.home, "Home", true) {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                }
                BottomNavItem(theme.icons.dashboard, "Workflows", false) {
                    navController.navigate(Screen.Workflows.route)
                }
                Spacer(modifier = Modifier.width(56.dp))
                BottomNavItem(theme.icons.checkCircle, "Approvals", false) {
                    navController.navigate(Screen.Approvals.route)
                }
                BottomNavItem(theme.icons.person, "Profile", false) {
                    navController.navigate(Screen.Profile.route)
                }
            }
        }
    }
}

@Composable
fun BottomNavItem(
    icon: ImageVector, 
    label: String, 
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val theme = VeldarTheme
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.85f else 1f,
        animationSpec = theme.animation.springResponsive,
        label = "nav_scale"
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(CircleShape)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .padding(theme.spacing.small)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (isSelected) Primary else White.copy(alpha = 0.3f),
            modifier = Modifier.size(26.dp)
        )
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun DashboardScreenPreview() {
    VeldarTheme {
        DashboardScreen(rememberNavController())
    }
}
