package com.example.veldar.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class Workflow(
    val id: String,
    val title: String,
    val description: String,
    val status: WorkflowStatus,
    val lastRun: String? = null,
    val category: String = "General"
)

enum class WorkflowStatus {
    ACTIVE, RUNNING, COMPLETED, FAILED, PAUSED
}
