package com.example.veldar.presentation.viewmodels

import com.example.veldar.presentation.navigation.NavigationEvent
import com.example.veldar.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor() : BaseViewModel<Unit, Unit>(Unit) {

    fun onGoogleLoginClicked() {
        // Handle Google Login Logic here
        navigate(NavigationEvent.Navigate(Screen.WalletSetup.route))
    }
}
