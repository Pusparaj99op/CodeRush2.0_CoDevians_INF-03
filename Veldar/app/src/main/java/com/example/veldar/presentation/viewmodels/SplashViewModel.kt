package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.presentation.navigation.NavigationEvent
import com.example.veldar.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SplashViewModel @Inject constructor() : BaseViewModel<Unit, Unit>(Unit) {

    init {
        startSplash()
    }

    private fun startSplash() {
        viewModelScope.launch {
            delay(2000)
            navigate(NavigationEvent.Navigate(
                route = Screen.Login.route,
                popUpTo = Screen.Splash.route,
                inclusive = true
            ))
        }
    }
}
