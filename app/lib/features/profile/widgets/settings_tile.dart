import 'package:flutter/material.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../ui/motion/press_scale.dart';

/// One settings row. Either navigates ([onTap]) or toggles ([value]) — never
/// both, so the affordance is unambiguous.
class SettingsTile extends StatelessWidget {
  const SettingsTile({
    super.key,
    required this.icon,
    required this.label,
    this.subtitle,
    this.onTap,
    this.value,
    this.onChanged,
    this.trailingText,
    this.destructive = false,
  });

  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback? onTap;

  /// Non-null renders a switch instead of a chevron.
  final bool? value;
  final ValueChanged<bool>? onChanged;

  final String? trailingText;

  /// Renders in the danger colour. Reserved for sign-out and delete, which the
  /// caller should also separate spatially from ordinary rows.
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final fg = destructive ? p.danger : p.headline;
    final isSwitch = value != null;

    final row = Container(
      constraints: const BoxConstraints(minHeight: 56),
      padding: const EdgeInsets.symmetric(
        horizontal: Insets.lg,
        vertical: Insets.md,
      ),
      child: Row(
        children: [
          Container(
            height: 36,
            width: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: destructive ? p.tintOf(p.danger) : p.overlay,
              borderRadius: Radii.smShape,
            ),
            child: Icon(icon, size: IconSizes.md, color: fg),
          ),
          const SizedBox(width: Insets.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(label, style: text.titleSmall!.copyWith(color: fg)),
                if (subtitle != null)
                  Text(
                    subtitle!,
                    style: text.bodySmall!.copyWith(color: p.muted),
                  ),
              ],
            ),
          ),
          if (trailingText != null) ...[
            Text(
              trailingText!,
              style: text.bodySmall!.copyWith(color: p.muted),
            ),
            const SizedBox(width: Insets.sm),
          ],
          if (isSwitch)
            Switch(value: value!, onChanged: onChanged)
          else if (onTap != null)
            Icon(Icons.chevron_right, size: IconSizes.md, color: p.muted),
        ],
      ),
    );

    if (isSwitch) {
      return Semantics(
        toggled: value,
        label: label,
        child: ExcludeSemantics(child: row),
      );
    }
    return PressScale(onTap: onTap, semanticLabel: label, child: row);
  }
}

/// Groups tiles into a bordered card with hairlines between them.
class SettingsGroup extends StatelessWidget {
  const SettingsGroup({super.key, required this.children, this.title});

  final List<Widget> children;
  final String? title;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) ...[
          Padding(
            padding: const EdgeInsets.only(
              left: Insets.xs,
              bottom: Insets.sm,
            ),
            child: Text(
              title!.toUpperCase(),
              style: Theme.of(
                context,
              ).textTheme.labelSmall!.copyWith(color: p.muted),
            ),
          ),
        ],
        Container(
          decoration: BoxDecoration(
            color: p.bgElevated,
            borderRadius: Radii.cardShape,
            border: Border.all(color: p.border),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                if (i > 0)
                  Divider(
                    height: 1,
                    thickness: 1,
                    color: p.border,
                    indent: Insets.giant,
                  ),
                children[i],
              ],
            ],
          ),
        ),
      ],
    );
  }
}
