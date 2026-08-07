package com.example.veldar.domain.repository

import com.example.veldar.domain.model.Approval
import kotlinx.coroutines.flow.Flow

interface ApprovalRepository {
    fun getPendingApprovals(): Flow<Result<List<Approval>>>
    suspend fun approve(id: String): Result<Unit>
    suspend fun reject(id: String): Result<Unit>
}
