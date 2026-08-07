package com.example.veldar.presentation.screens.subscription

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.veldar.presentation.components.NavigationEventHandler
import com.example.veldar.presentation.components.VeldarButton
import com.example.veldar.presentation.navigation.Screen
import com.example.veldar.presentation.theme.*
import com.example.veldar.presentation.viewmodels.SubscriptionViewModel
import com.example.veldar.utils.premiumGlass

@Composable
fun SubscriptionScreen(
    navController: NavController,
    viewModel: SubscriptionViewModel = hiltViewModel()
) {
    var isYearly by rememberSaveable { mutableStateOf(false) }
    var selectedPlan by rememberSaveable { mutableStateOf("Pro") }
    val theme = VeldarTheme

    NavigationEventHandler(navController, viewModel.navigationEvent)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .padding(theme.spacing.screenPadding)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(theme.spacing.huge))

            Text(
                text = "Choose your plan",
                color = White,
                style = Typography.displayMedium
            )

            Spacer(modifier = Modifier.height(theme.spacing.large))

            Box(
                modifier = Modifier
                    .clip(theme.radius.capsule)
                    .background(White.copy(alpha = 0.05f))
                    .padding(theme.spacing.extraSmall)
            ) {
                Row {
                    ToggleItem("Monthly", !isYearly) { isYearly = false }
                    ToggleItem("Yearly", isYearly) { isYearly = true }
                }
            }

            Spacer(modifier = Modifier.height(theme.spacing.huge))

            val freeFeatures = remember { listOf("Basic AI Workflows", "5 Approvals/month", "Community Support") }
            val proFeatures = remember { listOf("Advanced AI Agents", "Unlimited Approvals", "Priority Support") }
            val promaxFeatures = remember { listOf("Custom AI Models", "Enterprise Security", "24/7 Dedicated Support") }

            PlanCard(
                name = "Free",
                price = "$0",
                features = freeFeatures,
                isSelected = selectedPlan == "Free",
                onClick = { selectedPlan = "Free" }
            )

            Spacer(modifier = Modifier.height(theme.spacing.medium))

            PlanCard(
                name = "Pro",
                price = if (isYearly) "$190/yr" else "$19/mo",
                features = proFeatures,
                isSelected = selectedPlan == "Pro",
                isPopular = true,
                onClick = { selectedPlan = "Pro" }
            )

            Spacer(modifier = Modifier.height(theme.spacing.medium))

            PlanCard(
                name = "Promax",
                price = if (isYearly) "$490/yr" else "$49/mo",
                features = promaxFeatures,
                isSelected = selectedPlan == "Promax",
                onClick = { selectedPlan = "Promax" }
            )

            Spacer(modifier = Modifier.weight(1f))

            VeldarButton(
                text = "Get Started with $selectedPlan",
                onClick = {
                    viewModel.onGetStartedClicked()
                }
            )
        }
    }
}

@Composable
fun ToggleItem(text: String, isSelected: Boolean, onClick: () -> Unit) {
    val theme = VeldarTheme
    val bgColor by animateColorAsState(if (isSelected) White.copy(alpha = 0.1f) else Color.Transparent, label = "toggle_bg")
    
    Box(
        modifier = Modifier
            .clip(theme.radius.capsule)
            .background(bgColor)
            .clickable(onClick = onClick)
            .padding(horizontal = theme.spacing.screenPadding, vertical = theme.spacing.small),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = if (isSelected) White else White.copy(alpha = 0.5f),
            style = Typography.labelMedium
        )
    }
}

@Composable
fun PlanCard(
    name: String,
    price: String,
    features: List<String>,
    isSelected: Boolean,
    isPopular: Boolean = false,
    onClick: () -> Unit
) {
    val theme = VeldarTheme
    val borderColor by animateColorAsState(if (isSelected) Primary else White.copy(alpha = 0.05f), label = "plan_border")
    val borderWidth by animateDpAsState(if (isSelected) 2.dp else 1.dp, label = "plan_border_width")

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(theme.radius.hugeShape)
            .premiumGlass(theme.radius.hugeShape, alpha = if (isSelected) 0.08f else 0.04f)
            .border(borderWidth, borderColor, theme.radius.hugeShape)
            .clickable(onClick = onClick)
            .padding(theme.spacing.cardPadding)
    ) {
        if (isPopular) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .background(Primary, theme.radius.capsule)
                    .padding(horizontal = theme.spacing.itemSpacing, vertical = theme.spacing.extraSmall)
            ) {
                Text(text = "Popular", color = White, style = Typography.labelMedium)
            }
        }

        Column {
            Text(text = name, color = White, style = Typography.titleLarge)
            Text(
                text = price,
                color = White,
                style = Typography.displayMedium,
                modifier = Modifier.padding(vertical = theme.spacing.extraSmall)
            )
            
            features.forEach { feature ->
                Text(
                    text = "• $feature",
                    color = White.copy(alpha = 0.5f),
                    style = Typography.bodyMedium,
                    modifier = Modifier.padding(top = theme.spacing.extraSmall)
                )
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF000000)
@Composable
fun SubscriptionScreenPreview() {
    VeldarTheme {
        SubscriptionScreen(rememberNavController())
    }
}
