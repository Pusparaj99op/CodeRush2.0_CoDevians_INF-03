import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';
import '../motion/press_scale.dart';

/// Icon-only action with a guaranteed 44x44 hit area and a required
/// [semanticLabel] — an unlabelled icon button is invisible to a screen reader.
class VeldarIconButton extends StatelessWidget {
  const VeldarIconButton({
    super.key,
    required this.icon,
    required this.semanticLabel,
    this.onPressed,
    this.color,
    this.filled = false,
    this.size = IconSizes.lg,
  });

  final IconData icon;
  final String semanticLabel;
  final VoidCallback? onPressed;
  final Color? color;

  /// Draws a bordered elevated surface behind the glyph.
  final bool filled;
  final double size;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final fg = color ?? p.headline;
    final enabled = onPressed != null;

    return PressScale(
      enabled: enabled,
      onTap: onPressed,
      semanticLabel: semanticLabel,
      child: Container(
        constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
        alignment: Alignment.center,
        decoration: filled
            ? BoxDecoration(
                color: p.bgElevated,
                borderRadius: Radii.pillShape,
                border: Border.all(color: p.border),
              )
            : null,
        child: Icon(
          icon,
          size: size,
          color: enabled ? fg : fg.withValues(alpha: 0.4),
        ),
      ),
    );
  }
}
