import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/veldar_motion.dart';
import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';

/// Text input matching the website's auth field, with the accessibility rules
/// the website gets for free from HTML made explicit: a visible [label] (never
/// placeholder-only), [helperText] that persists rather than vanishing on
/// focus, and [errorText] rendered directly below the field it belongs to.
class VeldarTextField extends StatefulWidget {
  const VeldarTextField({
    super.key,
    required this.label,
    this.controller,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.keyboardType,
    this.textInputAction,
    this.autofillHints,
    this.obscureText = false,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.enabled = true,
    this.required = false,
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.inputFormatters,
    this.prefixIcon,
  });

  final String label;
  final TextEditingController? controller;
  final String? placeholder;

  /// Persistent guidance. Stays visible while the user types.
  final String? helperText;

  /// When non-null the field renders in its error state and announces the
  /// message to screen readers.
  final String? errorText;

  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;
  final bool obscureText;
  final int maxLines;
  final int? minLines;
  final int? maxLength;
  final bool enabled;
  final bool required;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;
  final List<TextInputFormatter>? inputFormatters;
  final IconData? prefixIcon;

  @override
  State<VeldarTextField> createState() => _VeldarTextFieldState();
}

class _VeldarTextFieldState extends State<VeldarTextField> {
  late final FocusNode _focus = FocusNode()..addListener(_onFocus);
  bool _focused = false;
  bool _obscured = true;

  void _onFocus() => setState(() => _focused = _focus.hasFocus);

  @override
  void dispose() {
    _focus
      ..removeListener(_onFocus)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final hasError = widget.errorText != null;

    final borderColor = hasError
        ? p.danger
        : _focused
        ? p.accent
        : p.border;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: Insets.sm),
          child: Text.rich(
            TextSpan(
              text: widget.label,
              children: [
                if (widget.required)
                  TextSpan(
                    text: ' *',
                    style: TextStyle(color: p.danger),
                    // The asterisk is decorative once the semantics below say
                    // "required"; leaving it audible reads as "label star".
                    semanticsLabel: '',
                  ),
              ],
            ),
            style: text.labelMedium!.copyWith(color: p.body),
          ),
        ),
        AnimatedContainer(
          duration: Motion.scaled(context, Motion.quick),
          decoration: BoxDecoration(
            color: widget.enabled ? p.bg : p.bg.withValues(alpha: 0.5),
            borderRadius: Radii.rowShape,
            border: Border.all(
              color: borderColor,
              // The focus ring must be visibly thicker, not just recoloured.
              width: _focused || hasError ? 2 : 1,
            ),
          ),
          child: TextField(
            controller: widget.controller,
            focusNode: _focus,
            enabled: widget.enabled,
            autofocus: widget.autofocus,
            keyboardType: widget.keyboardType,
            textInputAction: widget.textInputAction,
            autofillHints: widget.autofillHints,
            obscureText: widget.obscureText && _obscured,
            maxLines: widget.obscureText ? 1 : widget.maxLines,
            minLines: widget.minLines,
            maxLength: widget.maxLength,
            onChanged: widget.onChanged,
            onSubmitted: widget.onSubmitted,
            inputFormatters: widget.inputFormatters,
            style: text.bodyMedium!.copyWith(color: p.headline),
            cursorColor: p.cta,
            decoration: InputDecoration(
              isDense: true,
              counterText: '',
              border: InputBorder.none,
              hintText: widget.placeholder,
              hintStyle: text.bodyMedium!.copyWith(color: p.muted),
              prefixIcon: widget.prefixIcon == null
                  ? null
                  : Icon(widget.prefixIcon, size: IconSizes.md, color: p.muted),
              // 14 vertical on a 15pt line gives ~48 total, clearing the 44pt
              // touch minimum without a hard-coded height that would break
              // when the user scales system text up.
              contentPadding: const EdgeInsets.symmetric(
                horizontal: Insets.lg,
                vertical: 14,
              ),
              suffixIcon: widget.obscureText
                  ? IconButton(
                      icon: Icon(
                        _obscured
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: IconSizes.md,
                        color: p.muted,
                      ),
                      tooltip: _obscured ? 'Show password' : 'Hide password',
                      onPressed: () => setState(() => _obscured = !_obscured),
                    )
                  : null,
            ),
          ),
        ),
        if (hasError)
          Padding(
            padding: const EdgeInsets.only(top: Insets.sm, left: Insets.xs),
            child: Semantics(
              liveRegion: true,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon plus colour, so the error state does not depend on
                  // colour perception alone.
                  Icon(
                    Icons.error_outline,
                    size: IconSizes.sm,
                    color: p.danger,
                  ),
                  const SizedBox(width: Insets.xs),
                  Expanded(
                    child: Text(
                      widget.errorText!,
                      style: text.bodySmall!.copyWith(color: p.danger),
                    ),
                  ),
                ],
              ),
            ),
          )
        else if (widget.helperText != null)
          Padding(
            padding: const EdgeInsets.only(top: Insets.sm, left: Insets.xs),
            child: Text(
              widget.helperText!,
              style: text.bodySmall!.copyWith(color: p.muted),
            ),
          ),
      ],
    );
  }
}
