package com.example.veldar.presentation.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object WalletSetup : Screen("wallet_setup")
    object Subscription : Screen("subscription")
    object Dashboard : Screen("dashboard")
    
    // Phase 2
    object WalletOverview : Screen("wallet_overview")
    object Transactions : Screen("transactions")
    object Workflows : Screen("workflows")
    object Approvals : Screen("approvals")
    object Profile : Screen("profile")
    object CreateWorkflow : Screen("create_workflow")
    object TransactionDetail : Screen("transaction_detail/{id}") {
        fun createRoute(id: String) = "transaction_detail/$id"
    }
}
