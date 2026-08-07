import 'package:flutter/material.dart';

import '../../core/theme/veldar_motion.dart';
import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';
import '../motion/press_scale.dart';

enum VeldarButtonVariant {
  /// Orange fill. The one primary action on a screen.
  primary,

  /// Indigo fill. Auth and navigation-forward actions, matching the website's
  /// nav and sign-in buttons.
  accent,

  /// Outlined. Secondary action sitting next to a primary.
  secondary,

  /// No fill or border. Tertiary, inline actions.
  ghost,

  /// Red fill. Destructive and irreversible — cancel a workflow, deny a
  /// payment. Colour alone never carries the meaning; the label says it too.
  danger,
}

enum VeldarButtonSize { small, medium, large }

/// The app's single button.
///
/// Anatomy follows the website's CTA: a pill with a 15/600 label, optional
/// leading or trailing icon, `active:scale-[0.98]` press feedback, and a
/// spinner that replaces the label in place so the button never resizes
/// mid-request.
class VeldarButton extends StatelessWidget {
  const VeldarButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = VeldarButtonVariant.primary,
    this.size = VeldarButtonSize.medium,
    this.icon,
    this.trailingIcon,
    this.loading = false,
    this.expand = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final VeldarButtonVariant variant;
  final VeldarButtonSize size;
  final IconData? icon;
  final IconData? trailingIcon;

  /// While true the button is inert and shows a spinner. Callers must set this
  /// for any async action — a second tap on a submitting form creates a second
  /// workflow, and the backend has no idempotency key.
  final bool loading;

  /// Stretch to the available width.
  final bool expand;

  bool get _enabled => onPressed != null && !loading;

  double get _height => switch (size) {
    VeldarButtonSize.small => 40,
    VeldarButtonSize.medium => 48,
    // 44pt is the accessibility floor; medium and large clear it, and small is
    // only used inside rows that already provide padding around it.
    VeldarButtonSize.large => 56,
  };

  double get _padX => switch (size) {
    VeldarButtonSize.small => Insets.lg,
    VeldarButtonSize.medium => Insets.xxl,
    VeldarButtonSize.large => Insets.xxxl,
  };

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    final (Color? fill, Color fg, Color? edge) = switch (variant) {
      // ctaStrong, not cta: a 15pt white label needs 4.5:1, which the brand
      // orange does not give.
      VeldarButtonVariant.primary => (p.ctaStrong, p.onCta, null),
      VeldarButtonVariant.accent => (p.accent, p.onAccent, null),
      VeldarButtonVariant.secondary => (null, p.headline, p.border),
      VeldarButtonVariant.ghost => (null, p.headline, null),
      VeldarButtonVariant.danger => (p.danger, p.isDark ? Colors.black : Colors.white, null),
    };

    // 0.38 is Material's disabled opacity floor; below that the label stops
    // being legible against the surface.
    final opacity = _enabled ? 1.0 : 0.4;
    final labelStyle = (size == VeldarButtonSize.small
            ? text.labelMedium
            : text.labelLarge)!
        .copyWith(color: fg);

    final content = loading
        ? SizedBox(
            height: 18,
            width: 18,
            child: CircularProgressIndicator(strokeWidth: 2, color: fg),
          )
        : Row(
            mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: IconSizes.md, color: fg),
                const SizedBox(width: Insets.sm),
              ],
              Flexible(
                child: Text(
                  label,
                  style: labelStyle,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
              if (trailingIcon != null) ...[
                const SizedBox(width: Insets.sm),
                Icon(trailingIcon, size: IconSizes.md, color: fg),
              ],
            ],
          );

    return Semantics(
      button: true,
      enabled: _enabled,
      label: label,
      // Without this a screen reader announces a submitting button as tappable.
      hint: loading ? 'Working' : null,
      excludeSemantics: true,
      child: PressScale(
        enabled: _enabled,
        onTap: _enabled ? onPressed : null,
        child: AnimatedOpacity(
          opacity: opacity,
          duration: Motion.scaled(context, Motion.quick),
          child: AnimatedContainer(
            duration: Motion.scaled(context, Motion.quick),
            height: _height,
            width: expand ? double.infinity : null,
            padding: EdgeInsets.symmetric(horizontal: _padX),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: fill,
              borderRadius: Radii.pillShape,
              border: edge != null ? Border.all(color: edge) : null,
            ),
            child: content,
          ),
        ),
      ),
    );
  }
}
