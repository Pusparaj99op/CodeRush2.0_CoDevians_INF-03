import 'package:flutter/material.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../widgets/veldar_mark.dart';

/// Held while Firebase resolves the stored session. The router redirects away
/// the moment auth reports its first value, so this is usually one or two
/// frames — deliberately quiet rather than an animated intro that would make a
/// fast launch feel slow.
class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Scaffold(
      backgroundColor: p.bg,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const VeldarMark(size: 64),
            const SizedBox(height: Insets.xxl),
            SizedBox(
              height: 2,
              width: 96,
              child: LinearProgressIndicator(
                backgroundColor: p.border,
                color: p.cta,
                semanticsLabel: 'Loading Veldar',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
