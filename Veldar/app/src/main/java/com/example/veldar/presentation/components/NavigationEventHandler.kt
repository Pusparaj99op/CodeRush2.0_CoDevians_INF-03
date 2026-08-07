package com.example.veldar.presentation.components

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavController
import com.example.veldar.presentation.navigation.NavigationEvent
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.collectLatest

@Composable
fun NavigationEventHandler(
    navController: NavController,
    events: SharedFlow<NavigationEvent>
) {
    LaunchedEffect(Unit) {
        events.collectLatest { event ->
            when (event) {
                is NavigationEvent.Navigate -> {
                    navController.navigate(event.route) {
                        event.popUpTo?.let {
                            popUpTo(it) { inclusive = event.inclusive }
                        }
                    }
                }
                is NavigationEvent.NavigateBack -> {
                    navController.popBackStack()
                }
            }
        }
    }
}
