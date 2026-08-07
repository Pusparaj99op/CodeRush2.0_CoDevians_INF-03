import 'package:flutter/material.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/section_header.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';

/// Spend against budget, plus the settlement receipts behind it.
///
/// Real balances and receipts arrive in phase 3; the TestNet notice is here
/// from the start because it is the single most important thing for a user to
/// understand before they approve their first payment.
class WalletPage extends StatelessWidget {
  const WalletPage({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return VeldarScaffold(
      title: 'Wallet',
      extraBottomInset: Insets.bottomBarClearance,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Reveal(
            child: InlineBanner(
              message:
                  'Every payment settles on Algorand TestNet. No real funds '
                  'are moved at any point.',
              tone: BannerTone.info,
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Reveal(
            delay: const Duration(milliseconds: 80),
            child: VeldarGradientCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SPENT THIS MONTH',
                    style: text.labelSmall!.copyWith(color: Colors.white70),
                  ),
                  const SizedBox(height: Insets.sm),
                  Text(
                    '0 ALGO',
                    style: text.displayLarge!.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: Insets.xs),
                  Text(
                    'Across 0 trips',
                    style: text.bodySmall!.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: Insets.section),
          const Reveal(
            delay: Duration(milliseconds: 140),
            child: SectionHeader(
              eyebrow: 'Ledger',
              title: 'Receipts',
              subtitle: 'Every settlement, replayable end to end.',
            ),
          ),
          const SizedBox(height: Insets.xl),
          Reveal(
            delay: const Duration(milliseconds: 200),
            child: VeldarCard(
              padding: const EdgeInsets.symmetric(vertical: Insets.xxxl),
              child: Column(
                children: [
                  Icon(
                    Icons.receipt_long_outlined,
                    size: Insets.xxxl,
                    color: p.muted,
                  ),
                  const SizedBox(height: Insets.md),
                  Text(
                    'No payments yet',
                    style: text.bodyMedium!.copyWith(color: p.muted),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
