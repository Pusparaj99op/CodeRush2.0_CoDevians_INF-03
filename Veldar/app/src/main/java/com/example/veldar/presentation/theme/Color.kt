package com.example.veldar.presentation.theme

import androidx.compose.ui.graphics.Color

// Brand Colors - Linear & Stripe Inspired
val Primary = Color(0xFFFF5B1A)
val Secondary = Color(0xFFFF8552)
val Accent = Color(0xFF6366F1) // Indigo accent for premium feel

// Neutrals - Apple & Nothing Inspired
val Background = Color(0xFF000000) // Deep Black
val Surface = Color(0xFF0A0A0A)
val CardBackground = Color(0xFF141414)
val Border = Color(0xFF1F1F1F)
val BorderLight = Color(0xFF2E2E2E)

// Semantic
val Success = Color(0xFF10B981)
val Error = Color(0xFFEF4444)
val Warning = Color(0xFFF59E0B)
val White = Color(0xFFFFFFFF)
val TextPrimary = Color(0xFFF9FAFB)
val TextSecondary = Color(0xFF9CA3AF)

// Premium Gradients
val PrimaryGradient = listOf(Primary, Color(0xFFEA580C))
val BrandGradient = listOf(Primary, Color(0xFFF43F5E), Color(0xFF6366F1))
val GlassGradient = listOf(
    Color.White.copy(alpha = 0.08f),
    Color.White.copy(alpha = 0.02f)
)
val MeshGradient = listOf(
    Color(0xFF1E1E1E),
    Color(0xFF0A0A0A)
)
val StripeGradient = listOf(
    Color(0xFFFF5B1A).copy(alpha = 0.2f),
    Color(0xFF6366F1).copy(alpha = 0.1f),
    Color(0xFF000000)
)
