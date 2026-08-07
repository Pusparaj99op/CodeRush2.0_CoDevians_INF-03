import 'package:flutter/material.dart';

/// Motion tokens, mirroring the website's `components/reveal.tsx` and
/// `gsap-reveal.tsx` so the two surfaces feel like one product.
///
/// Every animated widget must route its duration through [scaled] so that a
/// user with "reduce motion" enabled gets the end state immediately instead of
/// a slowed-down version of the same movement.
abstract final class Motion {
  /// The website's `ease: [0.16, 1, 0.3, 1]`.
  static const enterCurve = Cubic(0.16, 1, 0.3, 1);

  /// GSAP `power3.out`.
  static const gsapCurve = Curves.easeOutCubic;

  /// Reveal entrance: `duration: 0.6`.
  static const enter = Duration(milliseconds: 600);

  /// Exits run at ~65% of the entrance so dismissal feels responsive.
  static const exit = Duration(milliseconds: 400);

  /// Micro-interactions — colour and opacity changes.
  static const quick = Duration(milliseconds: 200);

  /// Press feedback.
  static const press = Duration(milliseconds: 120);

  /// Route transitions.
  static const route = Duration(milliseconds: 320);

  /// List stagger step; the website uses `delay={i * 0.1}` on Reveal and
  /// `i * 0.12` on trace rows.
  static const staggerStep = Duration(milliseconds: 110);

  /// Cap on total stagger, so a 40-item list does not take four seconds to
  /// finish arriving.
  static const staggerCap = Duration(milliseconds: 660);

  /// Reveal travel distance: `y: 20 -> 0`.
  static const enterOffsetY = 20.0;

  /// Press scale, matching `active:scale-[0.98]`.
  static const pressScale = 0.98;

  /// Returns [d], or [Duration.zero] when the platform asks for reduced
  /// motion. Animating to the same end state with a zero duration keeps the
  /// widget tree identical in both cases.
  static Duration scaled(BuildContext context, Duration d) =>
      MediaQuery.maybeDisableAnimationsOf(context) ?? false ? Duration.zero : d;

  /// Stagger delay for item [index], clamped by [staggerCap].
  static Duration staggerFor(int index) {
    final ms = staggerStep.inMilliseconds * index;
    return Duration(
      milliseconds: ms > staggerCap.inMilliseconds
          ? staggerCap.inMilliseconds
          : ms,
    );
  }
}
