import 'package:flutter/material.dart';

import '../../../core/config/env.dart';
import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';
import '../../onboarding/widgets/veldar_mark.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return VeldarScaffold(
      title: 'About',
      showBackButton: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: Insets.xxl),
          const Reveal(child: Center(child: VeldarMark(size: 64))),
          const SizedBox(height: Insets.section),
          Reveal(
            delay: const Duration(milliseconds: 80),
            child: VeldarCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('An agent that spends carefully.', style: text.titleLarge),
                  const SizedBox(height: Insets.md),
                  Text(
                    'Veldar decomposes a travel goal into a workflow, shops a '
                    'marketplace of paid providers, and settles each step in '
                    'small Algorand payments as work is verified. Every offer, '
                    'approval, payment and result is written to a replayable '
                    'trace, so nothing happens that you did not authorise.',
                    style: text.bodyMedium!.copyWith(color: p.muted),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Reveal(
            delay: const Duration(milliseconds: 140),
            child: VeldarCard(
              child: Column(
                children: [
                  _Row(label: 'Version', value: '1.0.0'),
                  Divider(color: p.border, height: Insets.xl),
                  _Row(label: 'Network', value: 'Algorand TestNet'),
                  Divider(color: p.border, height: Insets.xl),
                  _Row(label: 'Backend', value: Env.apiBaseUrl),
                ],
              ),
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Center(
            child: Text(
              'Built at YCCE Nagpur.',
              style: text.bodySmall!.copyWith(color: p.dim),
            ),
          ),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    return Row(
      children: [
        Text(label, style: text.bodyMedium!.copyWith(color: p.muted)),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            style: text.bodySmall!.copyWith(color: p.body),
            textAlign: TextAlign.end,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
