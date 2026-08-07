import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:veldar_travel/core/theme/app_theme.dart';
import 'package:veldar_travel/core/theme/veldar_colors.dart';
import 'package:veldar_travel/core/theme/veldar_palette.dart';

/// WCAG relative luminance.
double _luminance(Color c) {
  double channel(double v) =>
      v <= 0.03928 ? v / 12.92 : math.pow((v + 0.055) / 1.055, 2.4).toDouble();
  return 0.2126 * channel(c.r) +
      0.7152 * channel(c.g) +
      0.0722 * channel(c.b);
}

double _contrast(Color fg, Color bg) {
  final a = _luminance(fg);
  final b = _luminance(bg);
  final hi = math.max(a, b);
  final lo = math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

void main() {
  group('dark palette matches the website tokens verbatim', () {
    final p = VeldarPalette.dark();

    test('surfaces and text', () {
      expect(p.bg, VeldarColors.bgDark); // --color-bg #0a0908
      expect(p.bgElevated, VeldarColors.bgElevatedDark); // --color-bg-elevated
      expect(p.headline, VeldarColors.headlineDark); // --color-headline
      expect(p.body, VeldarColors.bodyDark); // --color-body
      expect(p.muted, VeldarColors.mutedDark); // --color-muted
    });

    test('brand hues', () {
      expect(p.cta, const Color(0xFFFF5228)); // --color-cta
      expect(p.accent, const Color(0xFF6B5EF5)); // --color-accent
    });

    test('border is headline at 10%, as in globals.css', () {
      expect(p.border.a, closeTo(0.10, 0.005));
    });
  });

  test('brand hues are identical across themes', () {
    // A user switching theme must not see the brand shift colour.
    final d = VeldarPalette.dark();
    final l = VeldarPalette.light();
    expect(l.cta, d.cta);
    expect(l.accent, d.accent);
    expect(l.cardFrom, d.cardFrom);
    expect(l.cardTo, d.cardTo);
  });

  group('contrast (WCAG AA)', () {
    for (final entry in {
      'dark': VeldarPalette.dark(),
      'light': VeldarPalette.light(),
    }.entries) {
      final name = entry.key;
      final p = entry.value;

      test('$name: headline on bg clears 4.5:1', () {
        expect(_contrast(p.headline, p.bg), greaterThanOrEqualTo(4.5));
      });

      test('$name: body on bg clears 4.5:1', () {
        expect(_contrast(p.body, p.bg), greaterThanOrEqualTo(4.5));
      });

      test('$name: body on elevated clears 4.5:1', () {
        expect(_contrast(p.body, p.bgElevated), greaterThanOrEqualTo(4.5));
      });

      test('$name: muted secondary text clears 3:1', () {
        expect(_contrast(p.muted, p.bg), greaterThanOrEqualTo(3.0));
        expect(_contrast(p.muted, p.bgElevated), greaterThanOrEqualTo(3.0));
      });

      test('$name: semantic colours clear 3:1 as UI glyphs', () {
        for (final c in [p.success, p.danger, p.warning]) {
          expect(_contrast(c, p.bg), greaterThanOrEqualTo(3.0));
          expect(_contrast(c, p.bgElevated), greaterThanOrEqualTo(3.0));
        }
      });

      test('$name: button labels on a ctaStrong fill clear 4.5:1', () {
        // This is why ctaStrong exists — see VeldarColors.ctaStrong.
        expect(_contrast(p.onCta, p.ctaStrong), greaterThanOrEqualTo(4.5));
      });

      test('$name: text on an accent fill clears 4.5:1', () {
        expect(_contrast(p.onAccent, p.accent), greaterThanOrEqualTo(4.5));
      });

      test('$name: white clears 3:1 across the whole card gradient', () {
        // The gradient card carries display-size white copy, which WCAG holds
        // to 3:1. Both stops must pass, not just the darker one.
        for (final stop in [p.cardFrom, p.cardTo]) {
          expect(
            _contrast(Colors.white, stop),
            greaterThanOrEqualTo(3.0),
            reason: '$stop',
          );
        }
      });
    }

    test('the brand cta is documented as unsafe behind small white text', () {
      // Pins the reason ctaStrong exists. If the brand ever lightens further
      // this stays true; if it darkens past 4.5:1 this fails and ctaStrong can
      // be retired.
      expect(
        _contrast(Colors.white, VeldarPalette.dark().cta),
        lessThan(4.5),
      );
    });

    test('the brand cta is still safe as a glyph or coloured text on dark', () {
      final d = VeldarPalette.dark();
      expect(_contrast(d.cta, d.bg), greaterThanOrEqualTo(4.5));
    });
  });

  group('ThemeData', () {
    test('carries the palette extension in both modes', () {
      expect(AppTheme.dark().extension<VeldarPalette>(), isNotNull);
      expect(AppTheme.light().extension<VeldarPalette>(), isNotNull);
    });

    test('brightness matches the palette it was built from', () {
      expect(AppTheme.dark().brightness, Brightness.dark);
      expect(AppTheme.light().brightness, Brightness.light);
    });

    test('scaffold background is the palette bg, not a Material default', () {
      expect(
        AppTheme.dark().scaffoldBackgroundColor,
        VeldarPalette.dark().bg,
      );
      expect(
        AppTheme.light().scaffoldBackgroundColor,
        VeldarPalette.light().bg,
      );
    });
  });

  test('lerp between themes stays in range', () {
    final d = VeldarPalette.dark();
    final l = VeldarPalette.light();
    for (final t in [0.0, 0.25, 0.5, 0.75, 1.0]) {
      final mid = d.lerp(l, t);
      expect(mid.bg.a, inInclusiveRange(0, 1));
      expect(mid.cta.a, inInclusiveRange(0, 1));
    }
  });
}
