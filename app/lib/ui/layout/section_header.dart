import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_spacing.dart';
import '../buttons/veldar_button.dart';

/// The website's section header: an uppercase tracked eyebrow, a heading, and
/// an optional accent-coloured action on the trailing edge.
class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.eyebrow,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? eyebrow;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (eyebrow != null) ...[
                Text(
                  eyebrow!.toUpperCase(),
                  style: text.labelSmall!.copyWith(color: p.muted),
                ),
                const SizedBox(height: Insets.sm),
              ],
              // The heading is the semantic h2 of this section.
              Semantics(
                header: true,
                child: Text(title, style: text.headlineMedium),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: Insets.sm),
                Text(
                  subtitle!,
                  style: text.bodyMedium!.copyWith(color: p.muted),
                ),
              ],
            ],
          ),
        ),
        if (actionLabel != null && onAction != null)
          VeldarButton(
            label: actionLabel!,
            size: VeldarButtonSize.small,
            variant: VeldarButtonVariant.ghost,
            trailingIcon: Icons.arrow_forward,
            onPressed: onAction,
          ),
      ],
    );
  }
}
