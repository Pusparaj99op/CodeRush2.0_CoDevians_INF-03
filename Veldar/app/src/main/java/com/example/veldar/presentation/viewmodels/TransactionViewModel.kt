package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.domain.model.Transaction
import com.example.veldar.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

data class TransactionUiState(
    val transactions: List<Transaction> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val searchQuery: String = ""
)

@HiltViewModel
class TransactionViewModel @Inject constructor(
    private val repository: TransactionRepository
) : BaseViewModel<TransactionUiState, Unit>(TransactionUiState()) {

    init {
        loadTransactions()
    }

    fun loadTransactions() {
        updateState { it.copy(isLoading = true) }
        repository.getTransactions().onEach { result ->
            updateState { it.copy(
                transactions = result.getOrDefault(emptyList()),
                isLoading = false,
                error = if (result.isFailure) "Failed to load transactions" else null
            ) }
        }.launchIn(viewModelScope)
    }

    fun onSearchQueryChanged(query: String) {
        updateState { it.copy(searchQuery = query) }
    }
}
