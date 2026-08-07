package com.example.veldar.presentation.navigation

/**
 * Sealed class representing all navigation events in the app.
 */
sealed class NavigationEvent {
    data class Navigate(val route: String, val popUpTo: String? = null, val inclusive: Boolean = false) : NavigationEvent()
    object NavigateBack : NavigationEvent()
}
