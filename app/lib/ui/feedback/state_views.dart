import 'package:flutter/material.dart';

import '../../core/theme/veldar_palette.dart';
import '../../core/theme/veldar_radii.dart';
import '../../core/theme/veldar_spacing.dart';
import '../buttons/veldar_button.dart';

/// Shown when a list or screen has no content yet.
///
/// Always pairs the explanation with an action — an empty state that only says
/// "nothing here" leaves the user with nowhere to go.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Insets.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 64,
              width: 64,
              decoration: BoxDecoration(
                color: p.tintOf(p.accent),
                borderRadius: Radii.pillShape,
              ),
              child: Icon(icon, size: Insets.xxxl, color: p.accent),
            ),
            const SizedBox(height: Insets.xl),
            Text(title, style: text.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: Insets.sm),
            ConstrainedBox(
              // ~45 characters per line; wider than this and centred copy gets
              // hard to track back to the start of the next line.
              constraints: const BoxConstraints(maxWidth: 320),
              child: Text(
                message,
                style: text.bodyMedium!.copyWith(color: p.muted),
                textAlign: TextAlign.center,
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: Insets.xxl),
              VeldarButton(label: actionLabel!, onPressed: onAction),
            ],
          ],
        ),
      ),
    );
  }
}

/// Shown when a request failed.
///
/// [message] must say what went wrong in plain language and [onRetry] must give
/// a way out — an error with no recovery path is a dead end.
class ErrorStateView extends StatelessWidget {
  const ErrorStateView({
    super.key,
    required this.message,
    this.title = 'Something went wrong',
    this.onRetry,
    this.retryLabel = 'Try again',
    this.icon = Icons.cloud_off_outlined,
  });

  final String title;
  final String message;
  final VoidCallback? onRetry;
  final String retryLabel;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(Insets.xxl),
        child: Semantics(
          liveRegion: true,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 64,
                width: 64,
                decoration: BoxDecoration(
                  color: p.tintOf(p.danger),
                  borderRadius: Radii.pillShape,
                ),
                child: Icon(icon, size: Insets.xxxl, color: p.danger),
              ),
              const SizedBox(height: Insets.xl),
              Text(title, style: text.titleLarge, textAlign: TextAlign.center),
              const SizedBox(height: Insets.sm),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Text(
                  message,
                  style: text.bodyMedium!.copyWith(color: p.muted),
                  textAlign: TextAlign.center,
                ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: Insets.xxl),
                VeldarButton(
                  label: retryLabel,
                  icon: Icons.refresh,
                  variant: VeldarButtonVariant.secondary,
                  onPressed: onRetry,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

enum BannerTone { info, success, warning, danger }

/// Inline alert. The website's `rounded-xl border-red-500/30 bg-red-500/5`
/// treatment, generalised over the four tones.
class InlineBanner extends StatelessWidget {
  const InlineBanner({
    super.key,
    required this.message,
    this.tone = BannerTone.info,
    this.actionLabel,
    this.onAction,
  });

  final String message;
  final BannerTone tone;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    final (Color c, IconData icon) = switch (tone) {
      BannerTone.info => (p.accent, Icons.info_outline),
      BannerTone.success => (p.success, Icons.check_circle_outline),
      BannerTone.warning => (p.warning, Icons.warning_amber_rounded),
      BannerTone.danger => (p.danger, Icons.error_outline),
    };

    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: Insets.lg,
          vertical: Insets.md,
        ),
        decoration: BoxDecoration(
          color: p.tintOf(c),
          borderRadius: Radii.rowShape,
          border: Border.all(color: p.edgeOf(c)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: IconSizes.md, color: c),
            const SizedBox(width: Insets.md),
            Expanded(
              child: Text(
                message,
                style: text.bodySmall!.copyWith(color: c),
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(width: Insets.sm),
              VeldarButton(
                label: actionLabel!,
                size: VeldarButtonSize.small,
                variant: VeldarButtonVariant.ghost,
                onPressed: onAction,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
