import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';

/// Small pill label. Mirrors the website's badge: a tinted fill of the
/// semantic colour with the colour itself as the label.
///
/// [icon] is not decorative — it is what keeps the badge legible to a
/// colour-blind user, so every semantic badge should carry one.
class VeldarBadge extends StatelessWidget {
  const VeldarBadge({
    super.key,
    required this.label,
    this.color,
    this.icon,
    this.dense = false,
  });

  final String label;
  final Color? color;
  final IconData? icon;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final c = color ?? p.accent;
    final text = Theme.of(context).textTheme;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: dense ? Insets.sm : Insets.md,
        vertical: dense ? 3 : Insets.xs,
      ),
      decoration: BoxDecoration(
        color: p.tintOf(c),
        borderRadius: Radii.pillShape,
        border: Border.all(color: p.edgeOf(c)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: c),
            const SizedBox(width: Insets.xs),
          ],
          Text(
            label,
            style: text.labelSmall!.copyWith(color: c, letterSpacing: 0.4),
          ),
        ],
      ),
    );
  }
}
