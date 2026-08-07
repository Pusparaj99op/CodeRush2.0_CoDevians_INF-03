package com.example.veldar.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class Transaction(
    val id: String,
    val title: String,
    val amount: String,
    val date: String,
    val type: TransactionType,
    val status: String
)

enum class TransactionType {
    INCOMING, OUTGOING
}
