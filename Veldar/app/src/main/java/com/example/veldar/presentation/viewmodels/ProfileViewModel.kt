package com.example.veldar.presentation.viewmodels

import com.example.veldar.presentation.navigation.NavigationEvent
import com.example.veldar.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

data class ProfileUiState(
    val userName: String = "Alexander",
    val userEmail: String = "alex@veldar.ai",
    val plan: String = "Pro Max",
    val notificationsEnabled: Boolean = true
)

@HiltViewModel
class ProfileViewModel @Inject constructor() : BaseViewModel<ProfileUiState, Unit>(ProfileUiState()) {

    fun logout() {
        navigate(NavigationEvent.Navigate(Screen.Login.route, popUpTo = Screen.Dashboard.route, inclusive = true))
    }

    fun toggleNotifications() {
        updateState { it.copy(notificationsEnabled = !it.notificationsEnabled) }
    }
}
