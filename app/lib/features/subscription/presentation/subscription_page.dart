import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/models/tier.dart';
import '../../../providers/subscription_providers.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/tier_card.dart';

/// Plan comparison and switching. Mirrors the website's pricing page, including
/// its comparison table, so the two surfaces never quote different numbers.
class SubscriptionPage extends ConsumerWidget {
  const SubscriptionPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final current = ref.watch(tierProvider);
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return VeldarScaffold(
      title: 'Subscription',
      showBackButton: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: Insets.sm),
          Reveal(
            child: Text(
              'How much autonomy you give it is up to you.',
              style: text.headlineMedium,
            ),
          ),
          const SizedBox(height: Insets.md),
          Reveal(
            delay: const Duration(milliseconds: 60),
            child: Text(
              'The cap is enforced by the orchestrator, not the app — a step '
              'over your limit always pauses for approval.',
              style: text.bodyMedium!.copyWith(color: p.muted),
            ),
          ),
          const SizedBox(height: Insets.xxl),

          for (var i = 0; i < TierPolicy.all.length; i++)
            Padding(
              padding: const EdgeInsets.only(bottom: Insets.lg),
              child: Reveal.staggered(
                index: i + 1,
                child: TierCard(
                  policy: TierPolicy.all[i],
                  selected: current == TierPolicy.all[i].tier,
                  onTap: () => ref
                      .read(tierProvider.notifier)
                      .set(TierPolicy.all[i].tier),
                ),
              ),
            ),

          const SizedBox(height: Insets.lg),
          Reveal(
            delay: const Duration(milliseconds: 340),
            child: const InlineBanner(
              message:
                  'This build runs on Algorand TestNet, so no plan is ever '
                  'actually billed. Switching is instant.',
              tone: BannerTone.info,
            ),
          ),
          const SizedBox(height: Insets.section),

          Reveal(
            delay: const Duration(milliseconds: 400),
            child: VeldarCard(
              padding: const EdgeInsets.all(Insets.lg),
              child: Column(
                children: [
                  _ComparisonRow(
                    label: '',
                    values: [
                      for (final t in TierPolicy.all) t.name,
                    ],
                    header: true,
                  ),
                  for (final row in _rows) ...[
                    Divider(color: p.border, height: Insets.xl),
                    _ComparisonRow(label: row.$1, values: row.$2),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Mirrors `COMPARISON_ROWS` in `website/lib/content.ts`.
  static const _rows = <(String, List<String>)>[
    ('Per-step cap', ['0.5', '5', 'Unlimited']),
    ('Platform cut', ['2.5%', '1%', '0%']),
    ('Approval', ['Every payment', 'Above cap', 'Exceptions']),
    ('Concurrent trips', ['1', '5', 'Unlimited']),
    ('Full trace', ['Yes', 'Yes', 'Yes']),
  ];
}

class _ComparisonRow extends StatelessWidget {
  const _ComparisonRow({
    required this.label,
    required this.values,
    this.header = false,
  });

  final String label;
  final List<String> values;
  final bool header;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final style = header
        ? text.labelSmall!.copyWith(color: p.muted)
        : text.bodySmall!.copyWith(color: p.body);

    return Row(
      children: [
        Expanded(
          flex: 4,
          child: Text(
            label,
            style: text.bodySmall!.copyWith(color: p.muted),
          ),
        ),
        for (final v in values)
          Expanded(
            flex: 3,
            child: Text(
              header ? v.toUpperCase() : v,
              style: style,
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }
}
