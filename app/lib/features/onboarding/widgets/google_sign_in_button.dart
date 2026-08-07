import 'package:flutter/material.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../ui/motion/press_scale.dart';

/// Google sign-in button, matching the website's `components/google-button.tsx`
/// and Google's own branding rules: the four-colour mark at its official
/// proportions, never recoloured, with clear space around it.
class GoogleSignInButton extends StatelessWidget {
  const GoogleSignInButton({
    super.key,
    required this.label,
    this.onPressed,
    this.loading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final enabled = onPressed != null && !loading;

    return Semantics(
      button: true,
      enabled: enabled,
      label: label,
      hint: loading ? 'Signing in' : null,
      excludeSemantics: true,
      child: PressScale(
        enabled: enabled,
        onTap: enabled ? onPressed : null,
        child: Opacity(
          opacity: enabled ? 1 : 0.5,
          child: Container(
            height: 52,
            width: double.infinity,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: p.bgElevated,
              borderRadius: Radii.rowShape,
              border: Border.all(color: p.border),
            ),
            child: loading
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: p.headline,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const _GoogleMark(size: 18),
                      const SizedBox(width: Insets.md),
                      Text(
                        label,
                        style: text.labelLarge!.copyWith(color: p.headline),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}

/// The official Google "G", drawn as four arcs plus the crossbar. Colours are
/// Google's published brand values and must not be themed.
class _GoogleMark extends StatelessWidget {
  const _GoogleMark({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) =>
      SizedBox(height: size, width: size, child: CustomPaint(painter: _P()));
}

class _P extends CustomPainter {
  static const _blue = Color(0xFF4285F4);
  static const _green = Color(0xFF34A853);
  static const _yellow = Color(0xFFFBBC05);
  static const _red = Color(0xFFEA4335);

  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width;
    final stroke = s * 0.22;
    final rect = Rect.fromLTWH(
      stroke / 2,
      stroke / 2,
      s - stroke,
      s - stroke,
    );

    Paint arc(Color c) => Paint()
      ..color = c
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke;

    // Angles in radians, clockwise from 3 o'clock, matching the official mark.
    canvas.drawArc(rect, -0.35, -1.45, false, arc(_red)); // top right -> top
    canvas.drawArc(rect, -1.80, -1.55, false, arc(_yellow)); // left upper
    canvas.drawArc(rect, 2.90, -1.55, false, arc(_green)); // bottom left
    canvas.drawArc(rect, 1.35, -1.05, false, arc(_blue)); // bottom right

    // The horizontal crossbar of the G.
    final bar = Paint()..color = _blue;
    canvas.drawRect(
      Rect.fromLTWH(s * 0.5, s * 0.39, s * 0.5 - stroke * 0.1, stroke),
      bar,
    );
  }

  @override
  bool shouldRepaint(_P oldDelegate) => false;
}
