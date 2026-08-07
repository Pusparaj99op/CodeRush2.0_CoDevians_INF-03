import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/models/tier.dart';
import '../../../ui/buttons/veldar_button.dart';
import '../../../ui/buttons/veldar_icon_button.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/feedback/skeleton.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/feedback/veldar_badge.dart';
import '../../../ui/inputs/veldar_text_field.dart';
import '../../../ui/layout/section_header.dart';
import '../../../ui/motion/reveal.dart';
import '../../onboarding/widgets/google_sign_in_button.dart';
import '../../onboarding/widgets/veldar_mark.dart';
import '../../subscription/widgets/tier_card.dart';

/// Every shared widget, rendered side by side in light and dark.
///
/// This is the one place the whole design system is visible at once, which is
/// what makes a contrast or spacing regression obvious instead of something
/// you find later on one screen. Debug builds only.
class GalleryPage extends StatefulWidget {
  const GalleryPage({super.key});

  @override
  State<GalleryPage> createState() => _GalleryPageState();
}

class _GalleryPageState extends State<GalleryPage> {
  bool _side = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Component gallery'),
        actions: [
          VeldarIconButton(
            icon: _side ? Icons.view_agenda_outlined : Icons.vertical_split,
            semanticLabel: _side ? 'Single theme' : 'Both themes side by side',
            onPressed: () => setState(() => _side = !_side),
          ),
          const SizedBox(width: Insets.sm),
        ],
      ),
      body: _side
          ? Row(
              children: [
                Expanded(child: _Themed(theme: AppTheme.light())),
                const VerticalDivider(width: 1),
                Expanded(child: _Themed(theme: AppTheme.dark())),
              ],
            )
          : const _Sections(),
    );
  }
}

class _Themed extends StatelessWidget {
  const _Themed({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: theme,
      child: Builder(
        builder: (context) => ColoredBox(
          color: context.palette.bg,
          child: const _Sections(),
        ),
      ),
    );
  }
}

class _Sections extends StatelessWidget {
  const _Sections();

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return ListView(
      padding: const EdgeInsets.all(Insets.gutter),
      children: [
        const _H('Brand'),
        const Center(child: VeldarMark(size: 56)),
        const SizedBox(height: Insets.xl),

        const _H('Type scale'),
        Text('Display large', style: text.displayLarge),
        Text('Display medium', style: text.displayMedium),
        Text('Headline medium', style: text.headlineMedium),
        Text('Title large', style: text.titleLarge),
        Text('Title medium', style: text.titleMedium),
        Text('Body large — the quick brown fox', style: text.bodyLarge),
        Text('Body medium — the quick brown fox', style: text.bodyMedium),
        Text('Body small — 12.5 ALGO settled', style: text.bodySmall),
        Text('LABEL SMALL / EYEBROW', style: text.labelSmall),
        const SizedBox(height: Insets.xl),

        const _H('Palette'),
        Wrap(
          spacing: Insets.sm,
          runSpacing: Insets.sm,
          children: [
            _Swatch('bg', p.bg),
            _Swatch('elevated', p.bgElevated),
            _Swatch('cta', p.cta),
            _Swatch('accent', p.accent),
            _Swatch('headline', p.headline),
            _Swatch('body', p.body),
            _Swatch('muted', p.muted),
            _Swatch('success', p.success),
            _Swatch('danger', p.danger),
            _Swatch('warning', p.warning),
          ],
        ),
        const SizedBox(height: Insets.xl),

        const _H('Buttons'),
        for (final v in VeldarButtonVariant.values)
          Padding(
            padding: const EdgeInsets.only(bottom: Insets.sm),
            child: Row(
              children: [
                VeldarButton(
                  label: v.name,
                  variant: v,
                  onPressed: () {},
                ),
                const SizedBox(width: Insets.sm),
                VeldarButton(label: 'Off', variant: v),
                const SizedBox(width: Insets.sm),
                VeldarButton(label: '...', variant: v, loading: true),
              ],
            ),
          ),
        Row(
          children: [
            VeldarButton(
              label: 'Small',
              size: VeldarButtonSize.small,
              onPressed: () {},
            ),
            const SizedBox(width: Insets.sm),
            VeldarButton(
              label: 'Large',
              size: VeldarButtonSize.large,
              icon: Icons.flight_takeoff,
              onPressed: () {},
            ),
          ],
        ),
        const SizedBox(height: Insets.md),
        GoogleSignInButton(label: 'Continue with Google', onPressed: () {}),
        const SizedBox(height: Insets.xl),

        const _H('Badges'),
        Wrap(
          spacing: Insets.sm,
          runSpacing: Insets.sm,
          children: [
            VeldarBadge(
              label: 'Fulfilled',
              color: p.success,
              icon: Icons.check_circle_outline,
            ),
            VeldarBadge(
              label: 'Awaiting approval',
              color: p.warning,
              icon: Icons.hourglass_empty,
            ),
            VeldarBadge(
              label: 'Failed',
              color: p.danger,
              icon: Icons.error_outline,
            ),
            VeldarBadge(label: 'Paid', color: p.cta, icon: Icons.paid_outlined),
            VeldarBadge(label: 'Pro', color: p.accent),
          ],
        ),
        const SizedBox(height: Insets.xl),

        const _H('Cards'),
        const VeldarCard(child: Text('Standard card on an elevated surface.')),
        const SizedBox(height: Insets.md),
        const VeldarCard(
          lifted: true,
          child: Text('Lifted card — reserved for a screen focus.'),
        ),
        const SizedBox(height: Insets.md),
        const VeldarGradientCard(
          child: Text('Featured gradient card, white foreground.'),
        ),
        const SizedBox(height: Insets.xl),

        const _H('Inputs'),
        const VeldarTextField(
          label: 'Destination',
          placeholder: 'Where do you want to go?',
          helperText: 'Plain language is fine.',
          required: true,
        ),
        const SizedBox(height: Insets.lg),
        const VeldarTextField(
          label: 'Budget',
          placeholder: '12',
          errorText: 'Budget must be greater than zero.',
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: Insets.xl),

        const _H('Banners'),
        for (final t in BannerTone.values)
          Padding(
            padding: const EdgeInsets.only(bottom: Insets.sm),
            child: InlineBanner(message: 'A ${t.name} message.', tone: t),
          ),
        const SizedBox(height: Insets.xl),

        const _H('Loading'),
        const SkeletonList(count: 2, itemHeight: 64),
        const SizedBox(height: Insets.xl),

        const _H('Section header'),
        SectionHeader(
          eyebrow: 'Plans',
          title: 'How much autonomy',
          actionLabel: 'Compare',
          onAction: () {},
        ),
        const SizedBox(height: Insets.xl),

        const _H('Tier cards'),
        for (final policy in TierPolicy.all)
          Padding(
            padding: const EdgeInsets.only(bottom: Insets.md),
            child: TierCard(
              policy: policy,
              selected: policy.tier == Tier.pro,
              onTap: () {},
            ),
          ),
        const SizedBox(height: Insets.xl),

        const _H('Empty and error'),
        SizedBox(
          height: 300,
          child: EmptyState(
            icon: Icons.luggage_outlined,
            title: 'No trips yet',
            message: 'Tell Veldar where you want to go.',
            actionLabel: 'Plan a trip',
            onAction: () {},
          ),
        ),
        SizedBox(
          height: 300,
          child: ErrorStateView(
            message: 'Could not reach the orchestrator.',
            onRetry: () {},
          ),
        ),
        const SizedBox(height: Insets.xl),

        const _H('Motion'),
        const Reveal(child: VeldarCard(child: Text('Reveal on mount'))),
        const SizedBox(height: Insets.section),
      ],
    );
  }
}

class _H extends StatelessWidget {
  const _H(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: Insets.md, top: Insets.sm),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(
          context,
        ).textTheme.labelSmall!.copyWith(color: context.palette.muted),
      ),
    );
  }
}

class _Swatch extends StatelessWidget {
  const _Swatch(this.label, this.color);

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Column(
      children: [
        Container(
          height: 44,
          width: 60,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: p.border),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodySmall!.copyWith(fontSize: 10, color: p.muted),
        ),
      ],
    );
  }
}
