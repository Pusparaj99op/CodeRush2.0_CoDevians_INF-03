package com.example.veldar.presentation.screens.transactions

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.domain.model.Transaction
import com.example.veldar.domain.model.TransactionType
import com.example.veldar.presentation.components.AdaptiveWrapper
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.StaggeredAnimatedVisibility
import com.example.veldar.presentation.components.StateWrapper
import com.example.veldar.presentation.screens.dashboard.BottomNavigationBar
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.TransactionViewModel
import com.example.veldar.utils.premiumGlass

@Composable
fun TransactionsScreen(
    navController: NavController,
    viewModel: TransactionViewModel = hiltViewModel()
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
                isEmpty = uiState.transactions.isEmpty(),
                onRetry = { viewModel.loadTransactions() }
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = theme.spacing.screenPadding)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(theme.spacing.huge))
                        Text(
                            text = "History",
                            color = White,
                            style = Typography.displayMedium
                        )
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                    }

                    itemsIndexed(uiState.transactions) { index, transaction ->
                        StaggeredAnimatedVisibility(index) {
                            TransactionItem(transaction)
                        }
                        Spacer(modifier = Modifier.height(theme.spacing.itemSpacing))
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
fun TransactionItem(transaction: Transaction) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.largeShape, alpha = 0.04f)
            .clip(theme.radius.largeShape)
            .clickable { }
            .padding(theme.spacing.medium)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(
                            if (transaction.type == TransactionType.INCOMING) Success.copy(alpha = 0.08f) 
                            else White.copy(alpha = 0.04f), 
                            theme.radius.mediumShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (transaction.type == TransactionType.INCOMING) theme.icons.arrowDown else theme.icons.arrowUp,
                        contentDescription = null,
                        tint = if (transaction.type == TransactionType.INCOMING) Success else White.copy(alpha = 0.6f),
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(theme.spacing.medium))
                Column {
                    Text(text = transaction.title, color = White, style = Typography.titleSmall)
                    Text(text = transaction.date, color = White.copy(alpha = 0.4f), style = Typography.bodyMedium)
                }
            }
            
            Text(
                text = (if (transaction.type == TransactionType.INCOMING) "+" else "-") + transaction.amount,
                color = if (transaction.type == TransactionType.INCOMING) Success else White,
                style = Typography.titleMedium
            )
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun TransactionsScreenPreview() {
    VeldarTheme {
        TransactionsScreen(rememberNavController())
    }
}
