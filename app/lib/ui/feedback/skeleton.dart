import 'package:flutter/material.dart';

import '../../core/theme/veldar_motion.dart';
import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';

/// Shimmer placeholder.
///
/// Used instead of a spinner for anything over ~300ms, and sized to the real
/// content so the layout does not jump when data lands.
class Skeleton extends StatefulWidget {
  const Skeleton({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = Radii.smShape,
  });

  /// A full-width card-shaped placeholder.
  const Skeleton.card({super.key, this.height = 120})
    : width = double.infinity,
      borderRadius = Radii.cardShape;

  /// A single line of text.
  const Skeleton.line({super.key, this.width, this.height = 14})
    : borderRadius = Radii.smShape;

  final double? width;
  final double height;
  final BorderRadius borderRadius;

  @override
  State<Skeleton> createState() => _SkeletonState();
}

class _SkeletonState extends State<Skeleton>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      // A pulsing placeholder under reduced-motion is exactly the kind of
      // ambient movement the setting exists to stop, so hold it static.
      if (Motion.scaled(context, Motion.enter) != Duration.zero) {
        _c.repeat(reverse: true);
      }
    });
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final base = p.isDark
        ? Colors.white.withValues(alpha: 0.05)
        : Colors.black.withValues(alpha: 0.05);
    final high = p.isDark
        ? Colors.white.withValues(alpha: 0.10)
        : Colors.black.withValues(alpha: 0.09);

    return ExcludeSemantics(
      child: AnimatedBuilder(
        animation: _c,
        builder: (_, _) => Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            color: Color.lerp(base, high, _c.value),
            borderRadius: widget.borderRadius,
          ),
        ),
      ),
    );
  }
}

/// A stack of card skeletons, for a list that is still loading.
class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.count = 3, this.itemHeight = 96});

  final int count;
  final double itemHeight;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Loading',
      liveRegion: true,
      child: Column(
        children: [
          for (var i = 0; i < count; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == count - 1 ? 0 : Insets.md),
              child: Skeleton.card(height: itemHeight),
            ),
        ],
      ),
    );
  }
}
