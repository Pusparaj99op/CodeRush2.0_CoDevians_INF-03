package com.example.veldar.di

import com.example.veldar.data.repository.*
import com.example.veldar.domain.repository.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideDashboardRepository(mock: MockDashboardRepository): DashboardRepository = mock

    @Provides
    @Singleton
    fun provideWalletRepository(mock: MockWalletRepository): WalletRepository = mock

    @Provides
    @Singleton
    fun provideTransactionRepository(mock: MockTransactionRepository): TransactionRepository = mock

    @Provides
    @Singleton
    fun provideWorkflowRepository(mock: MockWorkflowRepository): WorkflowRepository = mock

    @Provides
    @Singleton
    fun provideApprovalRepository(mock: MockApprovalRepository): ApprovalRepository = mock
}
