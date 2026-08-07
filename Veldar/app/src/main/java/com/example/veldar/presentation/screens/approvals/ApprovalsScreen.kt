package com.example.veldar.presentation.screens.approvals

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.domain.model.Approval
import com.example.veldar.presentation.components.*
import com.example.veldar.presentation.screens.dashboard.BottomNavigationBar
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.ApprovalViewModel
import com.example.veldar.utils.premiumGlass

@Composable
fun ApprovalsScreen(
    navController: NavController,
    viewModel: ApprovalViewModel = hiltViewModel()
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
                isEmpty = uiState.pendingApprovals.isEmpty(),
                emptyMessage = "No pending approvals",
                onRetry = { viewModel.loadApprovals() }
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = theme.spacing.screenPadding)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(theme.spacing.huge))
                        Text(
                            text = "Approvals",
                            color = White,
                            style = Typography.displayMedium
                        )
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                    }

                    itemsIndexed(uiState.pendingApprovals) { index, approval ->
                        StaggeredAnimatedVisibility(index) {
                            ApprovalItem(
                                approval = approval,
                                onApprove = { viewModel.approve(approval.id) },
                                onReject = { viewModel.reject(approval.id) }
                            )
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
fun ApprovalItem(
    approval: Approval,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    val theme = VeldarTheme
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .premiumGlass(theme.radius.hugeShape, alpha = 0.06f)
            .padding(theme.spacing.cardPadding)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(White.copy(alpha = 0.05f), theme.radius.mediumShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(imageVector = theme.icons.checkCircle, contentDescription = null, tint = White.copy(alpha = 0.6f))
                    }
                    Spacer(modifier = Modifier.width(theme.spacing.medium))
                    Column {
                        Text(text = approval.title, color = White, style = Typography.titleMedium)
                        Text(text = "Requested by ${approval.requester}", color = White.copy(alpha = 0.4f), style = Typography.bodyMedium)
                    }
                }
                
                approval.amount?.let {
                    VeldarBadge(text = it, color = Primary)
                }
            }
            
            Spacer(modifier = Modifier.height(theme.spacing.large))
            
            Row(modifier = Modifier.fillMaxWidth()) {
                VeldarButton(
                    text = "Reject",
                    onClick = onReject,
                    isSecondary = true,
                    modifier = Modifier.weight(1f).height(48.dp)
                )
                Spacer(modifier = Modifier.width(theme.spacing.medium))
                VeldarButton(
                    text = "Approve",
                    onClick = onApprove,
                    modifier = Modifier.weight(1f).height(48.dp)
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun ApprovalsScreenPreview() {
    VeldarTheme {
        ApprovalsScreen(rememberNavController())
    }
}
