package com.example.veldar.presentation.theme

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.vector.ImageVector

@Immutable
data class VeldarIcons(
    val chevronRight: ImageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
    val security: ImageVector = Icons.Default.Security,
    val add: ImageVector = Icons.Default.Add,
    val upload: ImageVector = Icons.Default.FileUpload,
    val verified: ImageVector = Icons.Default.VerifiedUser,
    val notifications: ImageVector = Icons.Default.Notifications,
    val autoAwesome: ImageVector = Icons.Default.AutoAwesome,
    val trendingUp: ImageVector = Icons.AutoMirrored.Filled.TrendingUp,
    val work: ImageVector = Icons.Default.Work,
    val home: ImageVector = Icons.Default.Home,
    val dashboard: ImageVector = Icons.Default.Dashboard,
    val checkCircle: ImageVector = Icons.Default.CheckCircle,
    val person: ImageVector = Icons.Default.Person,
    val bolt: ImageVector = Icons.Default.Bolt,
    val google: ImageVector = Icons.AutoMirrored.Filled.Login,
    val arrowUp: ImageVector = Icons.AutoMirrored.Filled.CallMade,
    val arrowDown: ImageVector = Icons.AutoMirrored.Filled.CallReceived
)

val LocalIcons = staticCompositionLocalOf { VeldarIcons() }
