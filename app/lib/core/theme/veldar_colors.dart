import 'package:flutter/material.dart';

/// Raw brand constants, lifted verbatim from the website's Tailwind `@theme`
/// block in `website/app/globals.css`. Nothing in the app should reference
/// these directly — read them off [VeldarPalette] via `context.palette` so a
/// widget works in both themes. They live here so the mapping between the web
/// tokens and the app tokens stays auditable in one place.
abstract final class VeldarColors {
  // ---- website dark tokens (globals.css @theme) ----
  static const bgDark = Color(0xFF0A0908); // --color-bg
  static const bgElevatedDark = Color(0xFF0D0B09); // --color-bg-elevated
  static const headlineDark = Color(0xFFF5F3F0); // --color-headline
  static const bodyDark = Color(0xFFC9C5BF); // --color-body
  static const mutedDark = Color(0xFF8A8581); // --color-muted
  static const dimDark = Color(0xFF6B6660); // --color-footer-dim

  // ---- brand hues, identical in both themes ----
  static const cta = Color(0xFFFF5228); // --color-cta
  static const ctaHover = Color(0xFFFF6B42); // --color-cta-hover

  /// Darkened CTA, used **only** as a fill behind small white text.
  ///
  /// White on the brand `#ff5228` is 3.2:1 — enough for a large glyph but a
  /// failure for a 15pt button label, which WCAG holds to 4.5:1. The website
  /// has the same gap; on mobile, where the button *is* the primary control,
  /// it is worth closing. This shade is 4.9:1 against white and stays
  /// unmistakably in the brand family. `cta` itself is unchanged and remains
  /// what icons, borders, meters and coloured text use.
  static const ctaStrong = Color(0xFFCE3E0D);

  // Featured-card gradient. Darkened from the website's `#ff4a1f -> #ff6b2e`,
  // whose light stop gives white only 2.8:1 — below even the 3:1 large-text
  // floor. These stops clear 3:1 across the whole sweep, so the display-size
  // white copy the card is designed around stays legible.
  static const cardFrom = Color(0xFFE0400F);
  static const cardTo = Color(0xFFF0561F);
  static const accent = Color(0xFF6B5EF5); // --color-accent
  static const accentHover = Color(0xFF7E73F7); // --color-accent-hover

  // ---- derived light tokens ----
  // The website is dark-only, so these have no web counterpart to copy. They
  // are picked to keep the same warm-neutral cast (the dark bg is a warm
  // near-black, not a blue-grey) while clearing WCAG AA against body text.
  static const bgLight = Color(0xFFFAF8F6);
  static const bgElevatedLight = Color(0xFFFFFFFF);
  static const headlineLight = Color(0xFF14110F);
  static const bodyLight = Color(0xFF4A4541);
  static const mutedLight = Color(0xFF7A7570);
  static const dimLight = Color(0xFF938D87);

  // ---- semantics ----
  // Tailwind emerald/red/amber, as used in the website's trace rows and alerts.
  static const successDark = Color(0xFF34D399); // emerald-400
  static const successLight = Color(0xFF059669); // emerald-600
  static const dangerDark = Color(0xFFFCA5A5); // red-300 (text on dark)
  static const dangerLight = Color(0xFFDC2626); // red-600
  static const dangerBase = Color(0xFFEF4444); // red-500 (borders/fills)
  static const warningDark = Color(0xFFFDE68A); // amber-200 (text on dark)
  static const warningLight = Color(0xFFB45309); // amber-700
  static const warningBase = Color(0xFFF59E0B); // amber-500
}
