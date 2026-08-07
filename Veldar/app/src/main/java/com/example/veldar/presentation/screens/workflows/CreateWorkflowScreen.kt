package com.example.veldar.presentation.screens.workflows

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.components.AdaptiveWrapper
import com.example.veldar.presentation.components.VeldarButton
import com.example.veldar.presentation.components.VeldarTextField
import com.example.veldar.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateWorkflowScreen(navController: NavController) {
    val theme = VeldarTheme
    var name by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }

    Scaffold(
        containerColor = Background,
        topBar = {
            TopAppBar(
                title = { Text("Create Workflow", color = White, style = Typography.headlineMedium) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background)
            )
        }
    ) { paddingValues ->
        AdaptiveWrapper(
            modifier = Modifier.padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(theme.spacing.screenPadding)
            ) {
                VeldarTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Workflow Name",
                    placeholder = "e.g. Daily Data Audit",
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(theme.spacing.large))
                
                VeldarTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = "Description",
                    placeholder = "What should this agent do?",
                    singleLine = false,
                    modifier = Modifier.fillMaxWidth().height(140.dp)
                )
                
                Spacer(modifier = Modifier.weight(1f))
                
                VeldarButton(
                    text = "Create Workflow",
                    onClick = { navController.popBackStack() }
                )
                
                Spacer(modifier = Modifier.height(theme.spacing.large))
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun CreateWorkflowScreenPreview() {
    VeldarTheme {
        CreateWorkflowScreen(rememberNavController())
    }
}
