package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.domain.model.Workflow
import com.example.veldar.domain.repository.WorkflowRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WorkflowUiState(
    val workflows: List<Workflow> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class WorkflowViewModel @Inject constructor(
    private val repository: WorkflowRepository
) : BaseViewModel<WorkflowUiState, Unit>(WorkflowUiState()) {

    init {
        loadWorkflows()
    }

    fun loadWorkflows() {
        updateState { it.copy(isLoading = true) }
        repository.getWorkflows().onEach { result ->
            updateState { it.copy(
                workflows = result.getOrDefault(emptyList()),
                isLoading = false,
                error = if (result.isFailure) "Failed to load workflows" else null
            ) }
        }.launchIn(viewModelScope)
    }

    fun retryWorkflow(id: String) {
        viewModelScope.launch {
            repository.retryWorkflow(id)
            loadWorkflows()
        }
    }
    
    fun deleteWorkflow(id: String) {
        viewModelScope.launch {
            repository.deleteWorkflow(id)
            loadWorkflows()
        }
    }
}
