import 'package:flutter/material.dart';

import 'veldar_colors.dart';

/// Semantic colour tokens, resolved per theme.
///
/// Every widget reads colours from here rather than from [VeldarColors], so a
/// single widget definition renders correctly in light and dark. Attach it to
/// [ThemeData.extensions] (see `app_theme.dart`) and read it with
/// `context.palette`.
@immutable
class VeldarPalette extends ThemeExtension<VeldarPalette> {
  const VeldarPalette({
    required this.brightness,
    required this.bg,
    required this.bgElevated,
    required this.headline,
    required this.body,
    required this.muted,
    required this.dim,
    required this.border,
    required this.cta,
    required this.ctaHover,
    required this.ctaStrong,
    required this.onCta,
    required this.cardFrom,
    required this.cardTo,
    required this.accent,
    required this.accentHover,
    required this.onAccent,
    required this.success,
    required this.danger,
    required this.warning,
    required this.overlay,
    required this.scrim,
  });

  /// Website dark theme, token-for-token.
  factory VeldarPalette.dark() => VeldarPalette(
    brightness: Brightness.dark,
    bg: VeldarColors.bgDark,
    bgElevated: VeldarColors.bgElevatedDark,
    headline: VeldarColors.headlineDark,
    body: VeldarColors.bodyDark,
    muted: VeldarColors.mutedDark,
    dim: VeldarColors.dimDark,
    // --color-border: rgb(245 243 240 / 0.1)
    border: VeldarColors.headlineDark.withValues(alpha: 0.10),
    cta: VeldarColors.cta,
    ctaHover: VeldarColors.ctaHover,
    ctaStrong: VeldarColors.ctaStrong,
    onCta: Colors.white,
    cardFrom: VeldarColors.cardFrom,
    cardTo: VeldarColors.cardTo,
    accent: VeldarColors.accent,
    accentHover: VeldarColors.accentHover,
    onAccent: Colors.white,
    success: VeldarColors.successDark,
    danger: VeldarColors.dangerDark,
    warning: VeldarColors.warningDark,
    // The website's `bg-white/[0.03]` row fill.
    overlay: Colors.white.withValues(alpha: 0.03),
    scrim: Colors.black.withValues(alpha: 0.55),
  );

  /// Derived light theme.
  ///
  /// Note on [cta]: `#ff5228` on `#faf8f6` is roughly 3.1:1, which fails AA for
  /// body text. On light it is therefore only ever used as a *fill* behind
  /// white text (see [onCta]) or as a large-glyph accent — never as coloured
  /// text on the background. Anything that would be `text-cta` on the website
  /// falls back to [accent] here, which does clear AA.
  factory VeldarPalette.light() => VeldarPalette(
    brightness: Brightness.light,
    bg: VeldarColors.bgLight,
    bgElevated: VeldarColors.bgElevatedLight,
    headline: VeldarColors.headlineLight,
    body: VeldarColors.bodyLight,
    muted: VeldarColors.mutedLight,
    dim: VeldarColors.dimLight,
    border: VeldarColors.headlineLight.withValues(alpha: 0.12),
    cta: VeldarColors.cta,
    ctaHover: VeldarColors.ctaHover,
    ctaStrong: VeldarColors.ctaStrong,
    onCta: Colors.white,
    cardFrom: VeldarColors.cardFrom,
    cardTo: VeldarColors.cardTo,
    accent: VeldarColors.accent,
    accentHover: VeldarColors.accentHover,
    onAccent: Colors.white,
    success: VeldarColors.successLight,
    danger: VeldarColors.dangerLight,
    warning: VeldarColors.warningLight,
    overlay: Colors.black.withValues(alpha: 0.03),
    scrim: Colors.black.withValues(alpha: 0.45),
  );

  final Brightness brightness;

  /// Page background.
  final Color bg;

  /// Card and sheet surfaces sitting on [bg].
  final Color bgElevated;

  /// Headings and primary text.
  final Color headline;

  /// Body copy.
  final Color body;

  /// Secondary meta, eyebrow labels, placeholders.
  final Color muted;

  /// Least-emphasis text (footnotes, timestamps).
  final Color dim;

  /// The single border colour used on every card, row and input.
  final Color border;

  /// Primary call to action. Safe as an icon, border, meter fill or coloured
  /// text on [bg] — but not as a fill behind small text; use [ctaStrong] there.
  final Color cta;
  final Color ctaHover;

  /// Darkened [cta] for fills carrying small white text (buttons), where
  /// [cta] itself would fail WCAG AA.
  final Color ctaStrong;

  /// Foreground on a [cta] fill.
  final Color onCta;

  /// Featured-card gradient stops.
  final Color cardFrom;
  final Color cardTo;

  /// Secondary brand colour — auth, nav, active states, links.
  final Color accent;
  final Color accentHover;
  final Color onAccent;

  /// Step fulfilled / payment settled.
  final Color success;

  /// Failures and destructive actions.
  final Color danger;

  /// Awaiting approval, budget warnings.
  final Color warning;

  /// Faint fill for list rows layered on [bgElevated].
  final Color overlay;

  /// Modal barrier.
  final Color scrim;

  bool get isDark => brightness == Brightness.dark;

  /// The website's featured-card gradient:
  /// `linear-gradient(160deg, var(--color-card-from), var(--color-card-to))`.
  LinearGradient get cardGradient => LinearGradient(
    // 160deg in CSS is measured clockwise from "to top"; that lands close to
    // top-left → bottom-right, which is what these alignments give us.
    begin: const Alignment(-0.34, -1),
    end: const Alignment(0.34, 1),
    colors: [cardFrom, cardTo],
  );

  /// Tint used behind a semantic colour (badges, alert banners). Mirrors the
  /// website's `bg-red-500/10` / `bg-amber-500/10` treatment.
  Color tintOf(Color c) => c.withValues(alpha: isDark ? 0.14 : 0.10);

  /// Border used alongside [tintOf]. Mirrors `border-red-500/30`.
  Color edgeOf(Color c) => c.withValues(alpha: 0.30);

  @override
  VeldarPalette copyWith({
    Brightness? brightness,
    Color? bg,
    Color? bgElevated,
    Color? headline,
    Color? body,
    Color? muted,
    Color? dim,
    Color? border,
    Color? cta,
    Color? ctaHover,
    Color? ctaStrong,
    Color? onCta,
    Color? cardFrom,
    Color? cardTo,
    Color? accent,
    Color? accentHover,
    Color? onAccent,
    Color? success,
    Color? danger,
    Color? warning,
    Color? overlay,
    Color? scrim,
  }) {
    return VeldarPalette(
      brightness: brightness ?? this.brightness,
      bg: bg ?? this.bg,
      bgElevated: bgElevated ?? this.bgElevated,
      headline: headline ?? this.headline,
      body: body ?? this.body,
      muted: muted ?? this.muted,
      dim: dim ?? this.dim,
      border: border ?? this.border,
      cta: cta ?? this.cta,
      ctaHover: ctaHover ?? this.ctaHover,
      ctaStrong: ctaStrong ?? this.ctaStrong,
      onCta: onCta ?? this.onCta,
      cardFrom: cardFrom ?? this.cardFrom,
      cardTo: cardTo ?? this.cardTo,
      accent: accent ?? this.accent,
      accentHover: accentHover ?? this.accentHover,
      onAccent: onAccent ?? this.onAccent,
      success: success ?? this.success,
      danger: danger ?? this.danger,
      warning: warning ?? this.warning,
      overlay: overlay ?? this.overlay,
      scrim: scrim ?? this.scrim,
    );
  }

  @override
  VeldarPalette lerp(ThemeExtension<VeldarPalette>? other, double t) {
    if (other is! VeldarPalette) return this;
    Color c(Color a, Color b) => Color.lerp(a, b, t)!;
    return VeldarPalette(
      brightness: t < 0.5 ? brightness : other.brightness,
      bg: c(bg, other.bg),
      bgElevated: c(bgElevated, other.bgElevated),
      headline: c(headline, other.headline),
      body: c(body, other.body),
      muted: c(muted, other.muted),
      dim: c(dim, other.dim),
      border: c(border, other.border),
      cta: c(cta, other.cta),
      ctaHover: c(ctaHover, other.ctaHover),
      ctaStrong: c(ctaStrong, other.ctaStrong),
      onCta: c(onCta, other.onCta),
      cardFrom: c(cardFrom, other.cardFrom),
      cardTo: c(cardTo, other.cardTo),
      accent: c(accent, other.accent),
      accentHover: c(accentHover, other.accentHover),
      onAccent: c(onAccent, other.onAccent),
      success: c(success, other.success),
      danger: c(danger, other.danger),
      warning: c(warning, other.warning),
      overlay: c(overlay, other.overlay),
      scrim: c(scrim, other.scrim),
    );
  }
}

extension VeldarPaletteX on BuildContext {
  /// The active semantic palette. Falls back to dark if the extension is
  /// missing, which only happens in a bare `MaterialApp` inside a test.
  VeldarPalette get palette =>
      Theme.of(this).extension<VeldarPalette>() ?? VeldarPalette.dark();
}
