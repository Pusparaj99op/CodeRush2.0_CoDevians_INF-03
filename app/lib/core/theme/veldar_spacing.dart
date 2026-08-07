/// 4/8dp spacing rhythm. Every padding, gap and inset in the app comes from
/// here — no ad-hoc numbers in widgets.
abstract final class Insets {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
  static const xxxl = 32.0;
  static const huge = 40.0;
  static const giant = 56.0;

  /// Horizontal page gutter. The website uses `px-6` (24) rising to `lg:px-8`;
  /// 20 reads better at 375dp while staying on the 4dp grid.
  static const gutter = 20.0;

  /// Standard card padding — the website's `p-5` on trace cards.
  static const cardPad = 20.0;

  /// Roomier card padding for feature/pricing cards — the website's `p-7`.
  static const cardPadWide = 28.0;

  /// Vertical space between major sections.
  static const section = 40.0;

  /// Content inset at the bottom of a scroll view sitting under the tab bar,
  /// so the last row is never trapped behind it.
  static const bottomBarClearance = 96.0;
}

/// Icon sizes as tokens, so strokes and rhythm stay consistent.
abstract final class IconSizes {
  static const sm = 16.0;
  static const md = 20.0;
  static const lg = 24.0;
  static const xl = 32.0;
}
