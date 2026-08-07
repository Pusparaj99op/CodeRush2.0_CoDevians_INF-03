import 'package:flutter/material.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';

/// The Veldar logomark: a currency-styled "V" — two horizontal strike bars
/// through the glyph, the way a currency symbol is barred. Drawn rather than
/// shipped as an asset so it inherits the palette and scales cleanly.
class VeldarMark extends StatelessWidget {
  const VeldarMark({super.key, this.size = 48, this.showWordmark = true});

  final double size;
  final bool showWordmark;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Semantics(
      label: 'Veldar',
      image: true,
      excludeSemantics: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: size,
            width: size,
            decoration: BoxDecoration(
              gradient: p.cardGradient,
              borderRadius: BorderRadius.circular(size * 0.28),
            ),
            child: CustomPaint(painter: _BarredVPainter(color: Colors.white)),
          ),
          if (showWordmark) ...[
            SizedBox(height: size * 0.32),
            Text(
              'VELDAR',
              style: Theme.of(context).textTheme.titleMedium!.copyWith(
                color: p.headline,
                // The wordmark's wide tracking is the brand's signature.
                letterSpacing: size * 0.13,
                fontSize: size * 0.28,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _BarredVPainter extends CustomPainter {
  const _BarredVPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final stroke = w * 0.11;

    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.square
      ..strokeJoin = StrokeJoin.miter;

    // The V.
    final v = Path()
      ..moveTo(w * 0.28, h * 0.28)
      ..lineTo(w * 0.5, h * 0.72)
      ..lineTo(w * 0.72, h * 0.28);
    canvas.drawPath(v, paint);

    // The two currency strike bars.
    final bar = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke * 0.72
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(w * 0.2, h * 0.44), Offset(w * 0.8, h * 0.44), bar);
    canvas.drawLine(Offset(w * 0.26, h * 0.57), Offset(w * 0.74, h * 0.57), bar);
  }

  @override
  bool shouldRepaint(_BarredVPainter old) => old.color != color;
}

/// Ambient background glow — the website's hero blob
/// (`blur-[120px] opacity-20` behind the headline), rebuilt as a radial
/// gradient because a real 120px blur per frame is not worth the GPU time.
class AmbientGlow extends StatelessWidget {
  const AmbientGlow({
    super.key,
    this.diameter = 420,
    this.alignment = Alignment.topRight,
    this.opacity = 0.20,
  });

  final double diameter;
  final Alignment alignment;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return IgnorePointer(
      child: Align(
        alignment: alignment,
        child: Transform.translate(
          offset: Offset(diameter * 0.28, -diameter * 0.35),
          child: Container(
            height: diameter,
            width: diameter,
            decoration: BoxDecoration(
              borderRadius: Radii.pillShape,
              gradient: RadialGradient(
                colors: [
                  p.cta.withValues(alpha: opacity),
                  p.accent.withValues(alpha: opacity * 0.4),
                  p.cta.withValues(alpha: 0),
                ],
                stops: const [0, 0.5, 1],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
