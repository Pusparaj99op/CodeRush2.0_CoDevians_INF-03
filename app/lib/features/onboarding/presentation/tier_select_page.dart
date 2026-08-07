import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/models/tier.dart';
import '../../../providers/settings_providers.dart';
import '../../../providers/subscription_providers.dart';
import '../../../routing/routes.dart';
import '../../../ui/buttons/veldar_button.dart';
import '../../../ui/motion/reveal.dart';
import '../../subscription/widgets/tier_card.dart';

/// The last onboarding step. The tier is not cosmetic — it sets the
/// per-transaction cap the orchestrator enforces, so the copy explains what
/// the choice actually changes rather than just listing prices.
class TierSelectPage extends ConsumerStatefulWidget {
  const TierSelectPage({super.key});

  @override
  ConsumerState<TierSelectPage> createState() => _TierSelectPageState();
}

class _TierSelectPageState extends ConsumerState<TierSelectPage> {
  Tier _selected = Tier.free;

  @override
  void initState() {
    super.initState();
    _selected = ref.read(tierProvider);
  }

  Future<void> _continue() async {
    await ref.read(tierProvider.notifier).set(_selected);
    await ref.read(onboardingCompleteProvider.notifier).complete();
    if (mounted) context.go(Routes.home);
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: p.bg,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  Insets.gutter,
                  Insets.xxl,
                  Insets.gutter,
                  Insets.lg,
                ),
                children: [
                  Reveal(
                    child: Semantics(
                      header: true,
                      child: Text(
                        'How much autonomy?',
                        style: text.displayMedium,
                      ),
                    ),
                  ),
                  const SizedBox(height: Insets.md),
                  Reveal(
                    delay: const Duration(milliseconds: 80),
                    child: Text(
                      'Your plan sets the spend cap Veldar can clear without '
                      'asking. Anything above it pauses for your approval, '
                      'every time. You can change this later.',
                      style: text.bodyMedium!.copyWith(color: p.muted),
                    ),
                  ),
                  const SizedBox(height: Insets.xxl),
                  for (var i = 0; i < TierPolicy.all.length; i++)
                    Padding(
                      padding: const EdgeInsets.only(bottom: Insets.lg),
                      child: Reveal.staggered(
                        index: i + 2,
                        child: TierCard(
                          policy: TierPolicy.all[i],
                          selected: _selected == TierPolicy.all[i].tier,
                          onTap: () => setState(
                            () => _selected = TierPolicy.all[i].tier,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // The primary action stays pinned so it is reachable without
            // scrolling to the bottom of three tall cards.
            Container(
              padding: const EdgeInsets.fromLTRB(
                Insets.gutter,
                Insets.md,
                Insets.gutter,
                Insets.md,
              ),
              decoration: BoxDecoration(
                color: p.bg,
                border: Border(top: BorderSide(color: p.border)),
              ),
              child: VeldarButton(
                label: 'Continue with ${TierPolicy.of(_selected).name}',
                size: VeldarButtonSize.large,
                expand: true,
                trailingIcon: Icons.arrow_forward,
                onPressed: _continue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
