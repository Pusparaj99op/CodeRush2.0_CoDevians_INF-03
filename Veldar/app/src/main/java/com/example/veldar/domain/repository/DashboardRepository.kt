package com.example.veldar.domain.repository

import com.example.veldar.domain.model.Workflow
import kotlinx.coroutines.flow.Flow

interface DashboardRepository {
    fun getBalance(): Flow<Result<String>>
    fun getMonthlyBudget(): Flow<Result<Float>>
    fun getRecentWorkflows(): Flow<Result<List<Workflow>>>
}
