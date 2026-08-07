import 'package:flutter/material.dart';

import '../../../core/theme/veldar_motion.dart';
import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/models/tier.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/feedback/veldar_badge.dart';

/// A selectable plan card.
///
/// The featured tier uses the website's gradient treatment, which fixes its
/// foreground to white in both themes — hence the branching on [featured]
/// rather than reading everything from the palette.
class TierCard extends StatelessWidget {
  const TierCard({
    super.key,
    required this.policy,
    required this.selected,
    this.onTap,
    this.showFeatures = true,
  });

  final TierPolicy policy;
  final bool selected;
  final VoidCallback? onTap;
  final bool showFeatures;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final featured = policy.featured;

    final titleColor = featured ? Colors.white : p.headline;
    final bodyColor = featured
        ? Colors.white.withValues(alpha: 0.85)
        : p.muted;
    final checkColor = featured ? Colors.white : p.success;

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                policy.name,
                style: text.titleLarge!.copyWith(color: titleColor),
              ),
            ),
            if (featured)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: Insets.md,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.22),
                  borderRadius: Radii.pillShape,
                ),
                child: Text(
                  'POPULAR',
                  style: text.labelSmall!.copyWith(color: Colors.white),
                ),
              )
            else if (selected)
              Icon(Icons.check_circle, color: p.cta, size: IconSizes.lg),
          ],
        ),
        const SizedBox(height: Insets.sm),
        Text(
          policy.priceLabel,
          style: text.displayMedium!.copyWith(color: titleColor),
        ),
        const SizedBox(height: Insets.xs),
        Text(
          policy.tagline,
          style: text.bodySmall!.copyWith(color: bodyColor),
        ),
        const SizedBox(height: Insets.lg),
        Wrap(
          spacing: Insets.sm,
          runSpacing: Insets.sm,
          children: [
            _Chip(label: policy.capLabel, featured: featured),
            _Chip(label: policy.cutLabel, featured: featured),
          ],
        ),
        if (showFeatures) ...[
          const SizedBox(height: Insets.lg),
          for (final f in policy.features)
            Padding(
              padding: const EdgeInsets.only(bottom: Insets.sm),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.check, size: IconSizes.sm, color: checkColor),
                  const SizedBox(width: Insets.sm),
                  Expanded(
                    child: Text(
                      f,
                      style: text.bodySmall!.copyWith(
                        color: featured
                            ? Colors.white.withValues(alpha: 0.92)
                            : p.body,
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ],
    );

    final card = featured
        ? VeldarGradientCard(onTap: onTap, child: content)
        : VeldarCard(
            padding: const EdgeInsets.all(Insets.cardPadWide),
            onTap: onTap,
            child: content,
          );

    return Semantics(
      selected: selected,
      button: onTap != null,
      label: '${policy.name} plan, ${policy.priceLabel}',
      child: AnimatedContainer(
        duration: Motion.scaled(context, Motion.quick),
        decoration: BoxDecoration(
          borderRadius: Radii.cardShape,
          // Selection is a ring around the card rather than a colour swap, so
          // it reads the same on the gradient card as on a plain one.
          border: Border.all(
            color: selected ? p.cta : Colors.transparent,
            width: 2,
          ),
        ),
        padding: const EdgeInsets.all(2),
        child: card,
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.featured});

  final String label;
  final bool featured;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    if (featured) {
      return Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Insets.md,
          vertical: Insets.xs,
        ),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.18),
          borderRadius: Radii.pillShape,
        ),
        child: Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall!.copyWith(color: Colors.white, fontSize: 12),
        ),
      );
    }
    return VeldarBadge(label: label, color: p.accent, dense: true);
  }
}
