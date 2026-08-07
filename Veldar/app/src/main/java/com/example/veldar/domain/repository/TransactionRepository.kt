package com.example.veldar.domain.repository

import com.example.veldar.domain.model.Transaction
import kotlinx.coroutines.flow.Flow

interface TransactionRepository {
    fun getTransactions(): Flow<Result<List<Transaction>>>
    fun getTransactionById(id: String): Flow<Result<Transaction>>
}
