import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'veldar_palette.dart';
import 'veldar_radii.dart';
import 'veldar_spacing.dart';
import 'veldar_typography.dart';

/// Builds the two [ThemeData]s from a [VeldarPalette].
///
/// Widgets read colours from the palette extension rather than from
/// [ColorScheme], but the scheme is still populated properly so Material's own
/// widgets (dialogs, selection handles, the keyboard's autofill bar) inherit
/// the brand instead of falling back to purple.
abstract final class AppTheme {
  static ThemeData dark() => _build(VeldarPalette.dark());
  static ThemeData light() => _build(VeldarPalette.light());

  static ThemeData _build(VeldarPalette p) {
    final textTheme = VeldarType.textTheme(p.headline, p.body);

    final scheme = ColorScheme(
      brightness: p.brightness,
      primary: p.cta,
      onPrimary: p.onCta,
      secondary: p.accent,
      onSecondary: p.onAccent,
      error: p.danger,
      onError: p.isDark ? Colors.black : Colors.white,
      surface: p.bg,
      onSurface: p.headline,
      surfaceContainerHighest: p.bgElevated,
      outline: p.border,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: p.brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: p.bg,
      canvasColor: p.bg,
      textTheme: textTheme,
      fontFamily: VeldarType.display,
      extensions: [p],

      // Splash is handled per-widget by PressScale; Material's default ink
      // would fight the scale animation and double up the feedback.
      splashFactory: NoSplash.splashFactory,
      highlightColor: Colors.transparent,

      appBarTheme: AppBarTheme(
        backgroundColor: p.bg,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: p.headline, size: IconSizes.lg),
        titleTextStyle: textTheme.titleLarge,
        systemOverlayStyle: p.isDark
            ? SystemUiOverlayStyle.light
            : SystemUiOverlayStyle.dark,
      ),

      dividerTheme: DividerThemeData(color: p.border, thickness: 1, space: 1),

      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: p.bgElevated,
        surfaceTintColor: Colors.transparent,
        modalBarrierColor: p.scrim,
        shape: const RoundedRectangleBorder(borderRadius: Radii.sheetShape),
        showDragHandle: true,
        dragHandleColor: p.muted,
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: p.bgElevated,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(borderRadius: Radii.cardShape),
        titleTextStyle: textTheme.titleLarge,
        contentTextStyle: textTheme.bodyMedium,
      ),

      snackBarTheme: SnackBarThemeData(
        backgroundColor: p.bgElevated,
        contentTextStyle: textTheme.bodyMedium,
        actionTextColor: p.accent,
        behavior: SnackBarBehavior.floating,
        shape: const RoundedRectangleBorder(borderRadius: Radii.rowShape),
      ),

      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: p.cta,
        linearTrackColor: p.border,
        circularTrackColor: Colors.transparent,
      ),

      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? p.onCta : p.muted,
        ),
        trackColor: WidgetStateProperty.resolveWith(
          (s) => s.contains(WidgetState.selected) ? p.cta : p.border,
        ),
        trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
      ),

      textSelectionTheme: TextSelectionThemeData(
        cursorColor: p.cta,
        selectionColor: p.cta.withValues(alpha: 0.3),
        selectionHandleColor: p.cta,
      ),

      // A visible focus ring is required for keyboard and switch-control users.
      focusColor: p.accent,
    );
  }
}
