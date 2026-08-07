package com.example.veldar.domain.repository

import com.example.veldar.domain.model.Workflow
import kotlinx.coroutines.flow.Flow

interface WorkflowRepository {
    fun getWorkflows(): Flow<Result<List<Workflow>>>
    fun getWorkflowById(id: String): Flow<Result<Workflow>>
    suspend fun createWorkflow(workflow: Workflow): Result<Unit>
    suspend fun updateWorkflow(workflow: Workflow): Result<Unit>
    suspend fun deleteWorkflow(id: String): Result<Unit>
    suspend fun retryWorkflow(id: String): Result<Unit>
}
