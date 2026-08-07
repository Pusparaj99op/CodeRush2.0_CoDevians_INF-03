package com.example.veldar.presentation.screens.workflows

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.components.AdaptiveWrapper
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.StaggeredAnimatedVisibility
import com.example.veldar.presentation.components.StateWrapper
import com.example.veldar.presentation.navigation.Screen
import com.example.veldar.presentation.screens.dashboard.BottomNavigationBar
import com.example.veldar.presentation.screens.dashboard.WorkflowItem
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.WorkflowViewModel

@Composable
fun WorkflowsScreen(
    navController: NavController,
    viewModel: WorkflowViewModel = hiltViewModel()
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
            FloatingActionButton(
                onClick = { navController.navigate(Screen.CreateWorkflow.route) },
                containerColor = Primary,
                contentColor = White,
                shape = CircleShape
            ) {
                Icon(imageVector = theme.icons.add, contentDescription = "Create Workflow")
            }
        }
    ) { paddingValues ->
        AdaptiveWrapper(
            modifier = Modifier.padding(paddingValues)
        ) {
            StateWrapper(
                isLoading = uiState.isLoading,
                error = uiState.error,
                isEmpty = uiState.workflows.isEmpty(),
                onRetry = { viewModel.loadWorkflows() }
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = theme.spacing.screenPadding)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(theme.spacing.huge))
                        Text(
                            text = "Workflows",
                            color = White,
                            style = Typography.displayMedium
                        )
                        Spacer(modifier = Modifier.height(theme.spacing.large))
                    }

                    itemsIndexed(uiState.workflows) { index, workflow ->
                        StaggeredAnimatedVisibility(index) {
                            WorkflowItem(workflow)
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

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun WorkflowsScreenPreview() {
    VeldarTheme {
        WorkflowsScreen(rememberNavController())
    }
}
