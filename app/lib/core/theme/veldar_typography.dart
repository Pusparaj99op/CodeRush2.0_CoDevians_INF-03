import 'package:flutter/material.dart';

/// Type scale, mapped from the website's actual class usage.
///
/// Poppins carries display, title and label roles (the site's `--font-display`
/// and `--font-ui`); Inter carries body and anything numeric (`--font-meta`),
/// where its tabular figures stop ALGO amounts from jittering as they update.
abstract final class VeldarType {
  static const display = 'Poppins';
  static const meta = 'Inter';

  /// Tabular figures. Used for every currency amount, budget meter and
  /// countdown so digits keep a fixed advance width.
  static const tabularFigures = [FontFeature.tabularFigures()];

  static TextTheme textTheme(Color headline, Color body) => TextTheme(
    // Hero. The website's `text-4xl … leading-[1.05] tracking-tight`.
    displayLarge: TextStyle(
      fontFamily: display,
      fontSize: 36,
      height: 1.08,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.8,
      color: headline,
    ),
    // Page titles.
    displayMedium: TextStyle(
      fontFamily: display,
      fontSize: 28,
      height: 1.14,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.5,
      color: headline,
    ),
    // Section headings — the website's `text-3xl` H2.
    headlineMedium: TextStyle(
      fontFamily: display,
      fontSize: 22,
      height: 1.22,
      fontWeight: FontWeight.w600,
      letterSpacing: -0.3,
      color: headline,
    ),
    // Card headings — `text-xl font-semibold`.
    titleLarge: TextStyle(
      fontFamily: display,
      fontSize: 18,
      height: 1.3,
      fontWeight: FontWeight.w600,
      color: headline,
    ),
    // List row titles.
    titleMedium: TextStyle(
      fontFamily: display,
      fontSize: 15,
      height: 1.35,
      fontWeight: FontWeight.w600,
      color: headline,
    ),
    titleSmall: TextStyle(
      fontFamily: display,
      fontSize: 13,
      height: 1.35,
      fontWeight: FontWeight.w600,
      color: headline,
    ),
    // Lead paragraph — `text-lg leading-relaxed`.
    bodyLarge: TextStyle(
      fontFamily: meta,
      fontSize: 16,
      height: 1.55,
      color: body,
    ),
    // Default body — `text-sm leading-relaxed`. 15 rather than 14 because on
    // mobile 14 is below the comfortable reading floor.
    bodyMedium: TextStyle(
      fontFamily: meta,
      fontSize: 15,
      height: 1.5,
      color: body,
    ),
    // Meta / timestamps — `text-xs`.
    bodySmall: TextStyle(
      fontFamily: meta,
      fontSize: 13,
      height: 1.45,
      color: body,
    ),
    // Button labels.
    labelLarge: TextStyle(
      fontFamily: display,
      fontSize: 15,
      height: 1.2,
      fontWeight: FontWeight.w600,
      color: headline,
    ),
    labelMedium: TextStyle(
      fontFamily: display,
      fontSize: 13,
      height: 1.2,
      fontWeight: FontWeight.w500,
      color: headline,
    ),
    // Eyebrow — the website's
    // `text-xs font-medium uppercase tracking-[0.14em]`.
    labelSmall: TextStyle(
      fontFamily: display,
      fontSize: 11,
      height: 1.2,
      fontWeight: FontWeight.w500,
      letterSpacing: 1.5,
      color: headline,
    ),
  );
}

extension VeldarTextStyleX on TextStyle {
  /// Fixed-width digits, for amounts and anything that ticks.
  TextStyle get tabular => copyWith(fontFeatures: VeldarType.tabularFigures);
}
