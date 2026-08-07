import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_shadows.dart';
import '../../core/theme/veldar_spacing.dart';
import '../motion/press_scale.dart';

/// The website's standard card:
/// `rounded-2xl border border-[--color-border] bg-[--color-bg-elevated] p-8`.
class VeldarCard extends StatelessWidget {
  const VeldarCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(Insets.cardPad),
    this.onTap,
    this.lifted = false,
    this.semanticLabel,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  /// Adds the website's heavy drop shadow. Reserve it for a card that is the
  /// focus of its screen — using it everywhere flattens the hierarchy.
  final bool lifted;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final card = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: p.bgElevated,
        borderRadius: Radii.cardShape,
        border: Border.all(color: p.border),
        boxShadow: lifted ? Shadows.lifted(p) : null,
      ),
      child: child,
    );

    if (onTap == null) return card;
    return PressScale(onTap: onTap, semanticLabel: semanticLabel, child: card);
  }
}

/// The website's featured pricing card: no border, the
/// `#ff4a1f -> #ff6b2e` gradient at 160deg, an orange glow beneath, and white
/// text throughout.
///
/// Because the fill is fixed in both themes, everything inside must be white
/// or white-with-alpha — hence [onGradient] rather than reading the palette.
class VeldarGradientCard extends StatelessWidget {
  const VeldarGradientCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(Insets.cardPadWide),
    this.onTap,
    this.glow = true,
    this.semanticLabel,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final bool glow;
  final String? semanticLabel;

  /// Foreground on the gradient. Primary text.
  static const onGradient = Colors.white;

  /// Secondary text on the gradient — the website's `text-white/85`.
  static final onGradientMuted = Colors.white.withValues(alpha: 0.85);

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final card = Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        gradient: p.cardGradient,
        borderRadius: Radii.cardShape,
        boxShadow: glow ? Shadows.featured(p) : null,
      ),
      child: DefaultTextStyle.merge(
        style: const TextStyle(color: onGradient),
        child: child,
      ),
    );

    if (onTap == null) return card;
    return PressScale(onTap: onTap, semanticLabel: semanticLabel, child: card);
  }
}
