package com.example.veldar.data.repository

import com.example.veldar.domain.model.*
import com.example.veldar.domain.repository.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MockDashboardRepository @Inject constructor() : DashboardRepository {
    override fun getBalance(): Flow<Result<String>> = flow {
        emit(Result.success("$12,840.00"))
    }

    override fun getMonthlyBudget(): Flow<Result<Float>> = flow {
        emit(Result.success(0.6f))
    }

    override fun getRecentWorkflows(): Flow<Result<List<Workflow>>> = flow {
        val workflows = listOf(
            Workflow("1", "Neural Data Analysis", "Running on Llama 3.1", WorkflowStatus.RUNNING),
            Workflow("2", "Workflow Automation", "Scheduled for 3 PM", WorkflowStatus.ACTIVE)
        )
        emit(Result.success(workflows))
    }
}

@Singleton
class MockWalletRepository @Inject constructor() : WalletRepository {
    override fun getWallet(): Flow<Result<Wallet>> = flow {
        emit(Result.success(Wallet("0x1234...5678", "$12,840.00", "Main Wallet", "MPC")))
    }

    override suspend fun createWallet(): Result<Unit> = Result.success(Unit)

    override suspend fun importWallet(seedPhrase: String): Result<Unit> = Result.success(Unit)
}

@Singleton
class MockTransactionRepository @Inject constructor() : TransactionRepository {
    override fun getTransactions(): Flow<Result<List<Transaction>>> = flow {
        val transactions = listOf(
            Transaction("1", "AI Compute Payment", "$12.50", "Aug 07, 2026", TransactionType.OUTGOING, "Completed"),
            Transaction("2", "Deposit", "$500.00", "Aug 06, 2026", TransactionType.INCOMING, "Completed"),
            Transaction("3", "API Usage Fee", "$5.20", "Aug 05, 2026", TransactionType.OUTGOING, "Completed")
        )
        emit(Result.success(transactions))
    }

    override fun getTransactionById(id: String): Flow<Result<Transaction>> = flow {
        emit(Result.success(Transaction(id, "Transaction Detail", "$12.50", "Aug 07, 2026", TransactionType.OUTGOING, "Completed")))
    }
}

@Singleton
class MockWorkflowRepository @Inject constructor() : WorkflowRepository {
    override fun getWorkflows(): Flow<Result<List<Workflow>>> = flow {
        val workflows = listOf(
            Workflow("1", "Neural Data Analysis", "Running on Llama 3.1", WorkflowStatus.RUNNING),
            Workflow("2", "Workflow Automation", "Scheduled for 3 PM", WorkflowStatus.ACTIVE),
            Workflow("3", "LLM Fine-tuning", "80% complete", WorkflowStatus.FAILED)
        )
        emit(Result.success(workflows))
    }

    override fun getWorkflowById(id: String): Flow<Result<Workflow>> = flow {
        emit(Result.success(Workflow(id, "Workflow Detail", "Description", WorkflowStatus.ACTIVE)))
    }

    override suspend fun createWorkflow(workflow: Workflow): Result<Unit> = Result.success(Unit)
    override suspend fun updateWorkflow(workflow: Workflow): Result<Unit> = Result.success(Unit)
    override suspend fun deleteWorkflow(id: String): Result<Unit> = Result.success(Unit)
    override suspend fun retryWorkflow(id: String): Result<Unit> = Result.success(Unit)
}

@Singleton
class MockApprovalRepository @Inject constructor() : ApprovalRepository {
    override fun getPendingApprovals(): Flow<Result<List<Approval>>> = flow {
        val approvals = listOf(
            Approval("1", "Approve API Usage", "AI Agent 01", "2h ago", "$12.50"),
            Approval("2", "System Maintenance", "Root Admin", "5h ago")
        )
        emit(Result.success(approvals))
    }

    override suspend fun approve(id: String): Result<Unit> = Result.success(Unit)
    override suspend fun reject(id: String): Result<Unit> = Result.success(Unit)
}
