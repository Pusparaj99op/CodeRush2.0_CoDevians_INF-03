import 'package:flutter/material.dart';

import 'veldar_palette.dart';

/// A deliberately small elevation scale. The website uses exactly two real
/// shadows; adding more would only blur the hierarchy.
abstract final class Shadows {
  /// The website's featured pricing card:
  /// `shadow-[0_24px_60px_rgb(255_82_40_/_0.18)]`.
  static List<BoxShadow> featured(VeldarPalette p) => [
    BoxShadow(
      color: p.cta.withValues(alpha: 0.18),
      blurRadius: 60,
      offset: const Offset(0, 24),
    ),
  ];

  /// The website's trace card: `shadow-[0_24px_60px_rgb(0_0_0_/_0.45)]`.
  /// Softened on light, where a heavy black shadow reads as dirt.
  static List<BoxShadow> lifted(VeldarPalette p) => [
    BoxShadow(
      color: Colors.black.withValues(alpha: p.isDark ? 0.45 : 0.08),
      blurRadius: 60,
      offset: const Offset(0, 24),
    ),
  ];

  /// Bottom sheets and the tab bar.
  static List<BoxShadow> sheet(VeldarPalette p) => [
    BoxShadow(
      color: Colors.black.withValues(alpha: p.isDark ? 0.5 : 0.12),
      blurRadius: 32,
      offset: const Offset(0, -8),
    ),
  ];
}
