import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_spacing.dart';

/// Standard page chrome.
///
/// Centralises three things every screen would otherwise get subtly wrong:
/// the horizontal gutter, the bottom inset that keeps the last list row clear
/// of the tab bar, and a max content width so the layout stays readable on a
/// tablet instead of stretching edge to edge.
class VeldarScaffold extends StatelessWidget {
  const VeldarScaffold({
    super.key,
    required this.child,
    this.title,
    this.actions,
    this.leading,
    this.showBackButton = false,
    this.scrollable = true,
    this.bottomBar,
    this.padHorizontal = true,
    this.extraBottomInset = 0,
  });

  final Widget child;
  final String? title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool showBackButton;

  /// Wraps [child] in a scroll view. Set false when the child manages its own
  /// scrolling (a ListView) or must fill the viewport exactly.
  final bool scrollable;

  /// Pinned above the bottom safe area — a submit bar, for instance.
  final Widget? bottomBar;

  final bool padHorizontal;

  /// Extra bottom padding, e.g. [Insets.bottomBarClearance] on a tab screen.
  final double extraBottomInset;

  /// Tablet content ceiling. Long-form text edge to edge on a 10" screen is
  /// unreadable, so content stops widening past this.
  static const maxContentWidth = 640.0;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;

    Widget body = Padding(
      padding: EdgeInsets.only(
        left: padHorizontal ? Insets.gutter : 0,
        right: padHorizontal ? Insets.gutter : 0,
        bottom: extraBottomInset,
      ),
      child: child,
    );

    if (scrollable) {
      body = SingleChildScrollView(
        // Keeps the pull-to-scroll gesture alive on short pages, so the screen
        // never feels stuck.
        physics: const AlwaysScrollableScrollPhysics(),
        child: body,
      );
    }

    body = Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: maxContentWidth),
        child: body,
      ),
    );

    return Scaffold(
      backgroundColor: p.bg,
      appBar: title == null && !showBackButton && actions == null
          ? null
          : AppBar(
              title: title == null
                  ? null
                  : Semantics(header: true, child: Text(title!)),
              leading: leading,
              automaticallyImplyLeading: showBackButton,
              actions: actions,
            ),
      body: SafeArea(
        // The app bar already consumed the top inset when present.
        top: title == null && !showBackButton && actions == null,
        child: body,
      ),
      bottomNavigationBar: bottomBar == null
          ? null
          : SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  Insets.gutter,
                  Insets.md,
                  Insets.gutter,
                  Insets.md,
                ),
                child: bottomBar,
              ),
            ),
    );
  }
}
