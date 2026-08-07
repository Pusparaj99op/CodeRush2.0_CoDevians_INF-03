package com.example.veldar.presentation.viewmodels

import androidx.lifecycle.viewModelScope
import com.example.veldar.domain.model.Approval
import com.example.veldar.domain.repository.ApprovalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ApprovalUiState(
    val pendingApprovals: List<Approval> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ApprovalViewModel @Inject constructor(
    private val repository: ApprovalRepository
) : BaseViewModel<ApprovalUiState, Unit>(ApprovalUiState()) {

    init {
        loadApprovals()
    }

    fun loadApprovals() {
        updateState { it.copy(isLoading = true) }
        repository.getPendingApprovals().onEach { result ->
            updateState { it.copy(
                pendingApprovals = result.getOrDefault(emptyList()),
                isLoading = false,
                error = if (result.isFailure) "Failed to load approvals" else null
            ) }
        }.launchIn(viewModelScope)
    }

    fun approve(id: String) {
        viewModelScope.launch {
            repository.approve(id)
            loadApprovals()
        }
    }

    fun reject(id: String) {
        viewModelScope.launch {
            repository.reject(id)
            loadApprovals()
        }
    }
}
