package com.example.veldar.domain.repository

import com.example.veldar.domain.model.Wallet
import kotlinx.coroutines.flow.Flow

interface WalletRepository {
    fun getWallet(): Flow<Result<Wallet>>
    suspend fun createWallet(): Result<Unit>
    suspend fun importWallet(seedPhrase: String): Result<Unit>
}
