package com.example.veldar.presentation.viewmodels

import com.example.veldar.presentation.navigation.NavigationEvent
import com.example.veldar.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class SubscriptionViewModel @Inject constructor() : BaseViewModel<Unit, Unit>(Unit) {

    fun onGetStartedClicked() {
        navigate(NavigationEvent.Navigate(Screen.Dashboard.route))
    }
}
