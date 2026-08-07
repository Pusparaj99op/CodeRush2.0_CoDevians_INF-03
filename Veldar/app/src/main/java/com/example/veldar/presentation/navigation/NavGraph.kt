package com.example.veldar.presentation.navigation

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.screens.approvals.ApprovalsScreen
import com.example.veldar.presentation.screens.dashboard.DashboardScreen
import com.example.veldar.presentation.screens.login.LoginScreen
import com.example.veldar.presentation.screens.profile.ProfileScreen
import com.example.veldar.presentation.screens.splash.SplashScreen
import com.example.veldar.presentation.screens.subscription.SubscriptionScreen
import com.example.veldar.presentation.screens.transactions.TransactionsScreen
import com.example.veldar.presentation.screens.wallet.WalletOverviewScreen
import com.example.veldar.presentation.screens.wallet.WalletSetupScreen
import com.example.veldar.presentation.screens.workflows.CreateWorkflowScreen
import com.example.veldar.presentation.screens.workflows.WorkflowsScreen
import com.example.veldar.presentation.theme.VeldarTheme

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    
    val animNormal = VeldarTheme.animation.normal
    val animEase = VeldarTheme.animation.sharedElementEase

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        enterTransition = {
            fadeIn(animationSpec = tween(animNormal)) + 
            slideInHorizontally(
                initialOffsetX = { 300 },
                animationSpec = tween(animNormal, easing = animEase)
            )
        },
        exitTransition = {
            fadeOut(animationSpec = tween(animNormal)) +
            slideOutHorizontally(
                targetOffsetX = { -300 },
                animationSpec = tween(animNormal, easing = animEase)
            )
        },
        popEnterTransition = {
            fadeIn(animationSpec = tween(animNormal)) +
            slideInHorizontally(
                initialOffsetX = { -300 },
                animationSpec = tween(animNormal, easing = animEase)
            )
        },
        popExitTransition = {
            fadeOut(animationSpec = tween(animNormal)) +
            slideOutHorizontally(
                targetOffsetX = { 300 },
                animationSpec = tween(animNormal, easing = animEase)
            )
        }
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController)
        }
        composable(Screen.WalletSetup.route) {
            WalletSetupScreen(navController)
        }
        composable(Screen.Subscription.route) {
            SubscriptionScreen(navController)
        }
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController)
        }
        composable(Screen.Workflows.route) {
            WorkflowsScreen(navController)
        }
        composable(Screen.Approvals.route) {
            ApprovalsScreen(navController)
        }
        composable(Screen.Profile.route) {
            ProfileScreen(navController)
        }
        composable(Screen.WalletOverview.route) {
            WalletOverviewScreen(navController)
        }
        composable(Screen.Transactions.route) {
            TransactionsScreen(navController)
        }
        composable(Screen.CreateWorkflow.route) {
            CreateWorkflowScreen(navController)
        }
    }
}
