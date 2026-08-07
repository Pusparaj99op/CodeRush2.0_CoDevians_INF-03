import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/models/tier.dart';
import '../../../providers/auth_providers.dart';
import '../../../providers/subscription_providers.dart';
import '../../../routing/routes.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/feedback/veldar_badge.dart';
import '../../../ui/layout/section_header.dart';
import '../../../ui/motion/press_scale.dart';
import '../../../ui/motion/reveal.dart';
import '../../onboarding/widgets/veldar_mark.dart';

/// The starting point: a greeting, the one action that matters ("Where to?"),
/// and the plan's spend cap stated up front so the user always knows what
/// Veldar can do without asking them first.
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  static const _suggestions = [
    'A weekend in Goa for two',
    'Five days in Jaipur next month',
    'Tokyo in March, flights and hotel',
    'Beach trip under 10 ALGO',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final policy = ref.watch(tierPolicyProvider);

    final firstName = (user?.displayName ?? '').split(' ').first;

    return Scaffold(
      backgroundColor: p.bg,
      body: Stack(
        children: [
          const AmbientGlow(diameter: 340, opacity: 0.14),
          SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(
                Insets.gutter,
                Insets.lg,
                Insets.gutter,
                Insets.bottomBarClearance,
              ),
              children: [
                Reveal(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _greeting(),
                              style: text.bodyMedium!.copyWith(color: p.muted),
                            ),
                            Text(
                              firstName.isEmpty ? 'Traveller' : firstName,
                              style: text.displayMedium,
                            ),
                          ],
                        ),
                      ),
                      VeldarBadge(
                        label: policy.name,
                        color: policy.tier == Tier.free ? p.muted : p.cta,
                        icon: policy.tier == Tier.free
                            ? Icons.lock_outline
                            : Icons.bolt,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: Insets.xxl),

                Reveal(
                  delay: const Duration(milliseconds: 80),
                  child: _GoalPrompt(
                    onTap: () => context.push(Routes.plan),
                  ),
                ),
                const SizedBox(height: Insets.md),

                Reveal(
                  delay: const Duration(milliseconds: 140),
                  child: SizedBox(
                    height: 36,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _suggestions.length,
                      separatorBuilder: (_, _) =>
                          const SizedBox(width: Insets.sm),
                      itemBuilder: (context, i) => _SuggestionChip(
                        label: _suggestions[i],
                        onTap: () => context.push(
                          '${Routes.plan}?goal=${Uri.encodeComponent(_suggestions[i])}',
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: Insets.section),

                Reveal(
                  delay: const Duration(milliseconds: 200),
                  child: SectionHeader(
                    eyebrow: 'Your plan',
                    title: 'What Veldar can do alone',
                    actionLabel: 'Change',
                    onAction: () => context.push(Routes.subscription),
                  ),
                ),
                const SizedBox(height: Insets.lg),
                Reveal(
                  delay: const Duration(milliseconds: 260),
                  child: VeldarCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _PolicyRow(
                          icon: Icons.speed_outlined,
                          label: 'Spend cap',
                          value: policy.capLabel,
                        ),
                        Divider(color: p.border, height: Insets.xxl),
                        _PolicyRow(
                          icon: Icons.how_to_reg_outlined,
                          label: 'Asks you',
                          value: policy.approvalSummary,
                        ),
                        Divider(color: p.border, height: Insets.xxl),
                        _PolicyRow(
                          icon: Icons.receipt_long_outlined,
                          label: 'Platform fee',
                          value: policy.cutLabel,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: Insets.section),

                Reveal(
                  delay: const Duration(milliseconds: 320),
                  child: const SectionHeader(
                    eyebrow: 'How it works',
                    title: 'Three steps, one visible trace',
                  ),
                ),
                const SizedBox(height: Insets.lg),
                for (var i = 0; i < _steps.length; i++)
                  Padding(
                    padding: const EdgeInsets.only(bottom: Insets.md),
                    child: Reveal.staggered(
                      index: i + 4,
                      child: _StepCard(index: i + 1, step: _steps[i]),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning,';
    if (h < 18) return 'Good afternoon,';
    return 'Good evening,';
  }

  static const _steps = [
    (
      'Say where you want to go',
      'Plain language and a budget. Veldar compiles it into a step graph, '
          'with conditions for what can be skipped.',
    ),
    (
      'It shops and pays',
      'Providers quote in ALGO. Veldar pays through the Algorand facilitator '
          'as each booking clears, never before.',
    ),
    (
      'You stay in control',
      'Anything above your cap pauses for approval. Cancel any time and see '
          'exactly what was and was not purchased.',
    ),
  ];
}

class _GoalPrompt extends StatelessWidget {
  const _GoalPrompt({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return VeldarGradientCard(
      onTap: onTap,
      semanticLabel: 'Plan a new trip',
      padding: const EdgeInsets.all(Insets.cardPadWide),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Where to?',
            style: text.displayLarge!.copyWith(color: Colors.white),
          ),
          const SizedBox(height: Insets.sm),
          Text(
            'Describe the trip. Veldar plans it, prices it and books it.',
            style: text.bodyMedium!.copyWith(
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
          const SizedBox(height: Insets.xl),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: Insets.lg,
                  vertical: Insets.md,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: Radii.pillShape,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Plan a trip',
                      style: text.labelLarge!.copyWith(
                        color: context.palette.cta,
                      ),
                    ),
                    const SizedBox(width: Insets.sm),
                    Icon(
                      Icons.arrow_forward,
                      size: IconSizes.md,
                      color: context.palette.cta,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  const _SuggestionChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return PressScale(
      onTap: onTap,
      semanticLabel: 'Plan: $label',
      child: Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(horizontal: Insets.lg),
        decoration: BoxDecoration(
          color: p.bgElevated,
          borderRadius: Radii.pillShape,
          border: Border.all(color: p.border),
        ),
        child: Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall!.copyWith(color: p.body),
        ),
      ),
    );
  }
}

class _PolicyRow extends StatelessWidget {
  const _PolicyRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    return Row(
      children: [
        Icon(icon, size: IconSizes.md, color: p.muted),
        const SizedBox(width: Insets.md),
        Expanded(
          child: Text(
            label,
            style: text.bodyMedium!.copyWith(color: p.muted),
          ),
        ),
        Flexible(
          child: Text(
            value,
            style: text.titleSmall,
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({required this.index, required this.step});

  final int index;
  final (String, String) step;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    return VeldarCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 28,
            width: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: p.tintOf(p.cta),
              borderRadius: Radii.pillShape,
            ),
            child: Text(
              '$index',
              style: text.labelMedium!.copyWith(color: p.cta),
            ),
          ),
          const SizedBox(width: Insets.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(step.$1, style: text.titleMedium),
                const SizedBox(height: Insets.xs),
                Text(
                  step.$2,
                  style: text.bodySmall!.copyWith(color: p.muted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
