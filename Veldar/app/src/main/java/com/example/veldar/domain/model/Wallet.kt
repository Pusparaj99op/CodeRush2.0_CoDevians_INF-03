package com.example.veldar.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class Wallet(
    val address: String,
    val balance: String,
    val name: String,
    val type: String
)
