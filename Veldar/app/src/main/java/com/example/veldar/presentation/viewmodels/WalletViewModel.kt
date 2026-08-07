package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.domain.model.Wallet
import com.example.veldar.domain.repository.WalletRepository
import com.example.veldar.presentation.navigation.NavigationEvent
import com.example.veldar.presentation.navigation.Screen
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WalletUiState(
    val wallet: Wallet? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val repository: WalletRepository
) : BaseViewModel<WalletUiState, Unit>(WalletUiState()) {

    init {
        loadWallet()
    }

    fun loadWallet() {
        updateState { it.copy(isLoading = true) }
        repository.getWallet().onEach { result ->
            updateState { it.copy(
                wallet = result.getOrNull(),
                isLoading = false,
                error = if (result.isFailure) "Failed to load wallet" else null
            ) }
        }.launchIn(viewModelScope)
    }

    fun onProceedClicked() {
        navigate(NavigationEvent.Navigate(Screen.Subscription.route))
    }

    fun createWallet() {
        viewModelScope.launch {
            updateState { it.copy(isLoading = true) }
            val result = repository.createWallet()
            updateState { it.copy(isLoading = false) }
            if (result.isSuccess) {
                loadWallet()
            }
        }
    }
}
