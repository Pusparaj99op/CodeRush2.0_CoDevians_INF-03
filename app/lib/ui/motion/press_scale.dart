import 'package:flutter/material.dart';

import '../../core/theme/veldar_motion.dart';

/// Wraps a tappable surface with the website's `active:scale-[0.98]` feedback.
///
/// Scale is used rather than a ripple or a size change because it gives visual
/// response inside 120ms without shifting the layout bounds of anything around
/// it. The whole child stays hit-testable during the animation.
class PressScale extends StatefulWidget {
  const PressScale({
    super.key,
    required this.child,
    this.onTap,
    this.onLongPress,
    this.scale = Motion.pressScale,
    this.semanticLabel,
    this.borderRadius,
    this.enabled = true,
  });

  final Widget child;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final double scale;
  final String? semanticLabel;
  final BorderRadius? borderRadius;
  final bool enabled;

  @override
  State<PressScale> createState() => _PressScaleState();
}

class _PressScaleState extends State<PressScale> {
  bool _down = false;

  bool get _interactive =>
      widget.enabled && (widget.onTap != null || widget.onLongPress != null);

  void _set(bool v) {
    if (!_interactive || _down == v) return;
    setState(() => _down = v);
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: _interactive,
      enabled: widget.enabled,
      label: widget.semanticLabel,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _interactive ? widget.onTap : null,
        onLongPress: _interactive ? widget.onLongPress : null,
        onTapDown: (_) => _set(true),
        onTapUp: (_) => _set(false),
        onTapCancel: () => _set(false),
        child: AnimatedScale(
          scale: _down ? widget.scale : 1.0,
          duration: Motion.scaled(context, Motion.press),
          curve: Curves.easeOut,
          child: widget.child,
        ),
      ),
    );
  }
}
