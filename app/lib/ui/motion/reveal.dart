import 'package:flutter/material.dart';

import '../../core/theme/veldar_motion.dart';

/// The app's counterpart to the website's `components/reveal.tsx`:
/// fade in from `opacity: 0, y: 20` over 600ms on `cubic-bezier(.16,1,.3,1)`.
///
/// Runs once on mount rather than on scroll. On mobile the whole first screen
/// is effectively "in view", and a scroll-triggered reveal would leave content
/// invisible for anyone who lands mid-list from a deep link.
class Reveal extends StatefulWidget {
  const Reveal({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.offsetY = Motion.enterOffsetY,
  });

  /// Convenience for list children — applies the standard stagger for [index].
  Reveal.staggered({
    super.key,
    required this.child,
    required int index,
    this.offsetY = Motion.enterOffsetY,
  }) : delay = Motion.staggerFor(index);

  final Widget child;
  final Duration delay;
  final double offsetY;

  @override
  State<Reveal> createState() => _RevealState();
}

class _RevealState extends State<Reveal> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: Motion.enter,
  );
  late final Animation<double> _t = CurvedAnimation(
    parent: _c,
    curve: Motion.enterCurve,
  );

  @override
  void initState() {
    super.initState();
    // Deferred to the first frame so MediaQuery is available: a reduced-motion
    // user should land on the end state, not watch a shortened animation.
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;
      if (Motion.scaled(context, Motion.enter) == Duration.zero) {
        _c.value = 1;
        return;
      }
      if (widget.delay > Duration.zero) {
        await Future<void>.delayed(widget.delay);
        if (!mounted) return;
      }
      _c.forward();
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _t,
      builder: (context, child) => Opacity(
        opacity: _t.value,
        child: Transform.translate(
          offset: Offset(0, widget.offsetY * (1 - _t.value)),
          child: child,
        ),
      ),
      child: widget.child,
    );
  }
}
