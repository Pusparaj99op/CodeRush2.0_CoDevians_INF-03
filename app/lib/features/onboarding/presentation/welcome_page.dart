import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../routing/routes.dart';
import '../../../ui/buttons/veldar_button.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/veldar_mark.dart';

/// First run. Carries the website's hero language so someone arriving from
/// codevians.online recognises the product immediately.
class WelcomePage extends StatelessWidget {
  const WelcomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: p.bg,
      body: Stack(
        children: [
          const AmbientGlow(),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(Insets.gutter),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Spacer(flex: 2),
                  const Reveal(
                    child: VeldarMark(size: 56, showWordmark: false),
                  ),
                  const SizedBox(height: Insets.xxxl),
                  Reveal(
                    delay: const Duration(milliseconds: 80),
                    child: Semantics(
                      header: true,
                      child: Text(
                        'An agent that\nbooks carefully.',
                        style: text.displayLarge,
                      ),
                    ),
                  ),
                  const SizedBox(height: Insets.lg),
                  Reveal(
                    delay: const Duration(milliseconds: 160),
                    child: Text(
                      'Tell Veldar where you want to go. It shops flights, '
                      'hotels and activities, pays each provider only as work '
                      'clears, and shows you everything before it is final.',
                      style: text.bodyLarge!.copyWith(color: p.muted),
                    ),
                  ),
                  const Spacer(flex: 3),
                  Reveal(
                    delay: const Duration(milliseconds: 240),
                    child: Column(
                      children: [
                        VeldarButton(
                          label: 'Get started',
                          size: VeldarButtonSize.large,
                          trailingIcon: Icons.arrow_forward,
                          expand: true,
                          onPressed: () => context.go(Routes.signIn),
                        ),
                        const SizedBox(height: Insets.md),
                        Text(
                          'Payments settle on Algorand TestNet. No real funds '
                          'are ever moved.',
                          style: text.bodySmall!.copyWith(color: p.dim),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: Insets.lg),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
