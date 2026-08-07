package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.domain.model.Workflow
import com.example.veldar.domain.repository.DashboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import javax.inject.Inject

data class DashboardUiState(
    val balance: String = "$0.00",
    val budgetProgress: Float = 0f,
    val recentWorkflows: List<Workflow> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: DashboardRepository
) : BaseViewModel<DashboardUiState, Unit>(DashboardUiState()) {

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        updateState { it.copy(isLoading = true) }
        
        combine(
            repository.getBalance(),
            repository.getMonthlyBudget(),
            repository.getRecentWorkflows()
        ) { balanceResult, budgetResult, workflowsResult ->
            updateState { state ->
                state.copy(
                    balance = balanceResult.getOrDefault("$0.00"),
                    budgetProgress = budgetResult.getOrDefault(0f),
                    recentWorkflows = workflowsResult.getOrDefault(emptyList()),
                    isLoading = false,
                    error = if (balanceResult.isFailure || budgetResult.isFailure || workflowsResult.isFailure) 
                            "Failed to load dashboard data" else null
                )
            }
        }.launchIn(viewModelScope)
    }
}
