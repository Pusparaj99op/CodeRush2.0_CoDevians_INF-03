package com.example.veldar.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class Approval(
    val id: String,
    val title: String,
    val requester: String,
    val timestamp: String,
    val amount: String? = null,
    val status: ApprovalStatus = ApprovalStatus.PENDING
)

enum class ApprovalStatus {
    PENDING, APPROVED, REJECTED
}
