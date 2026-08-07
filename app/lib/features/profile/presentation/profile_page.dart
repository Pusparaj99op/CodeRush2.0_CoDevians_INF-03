import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_radii.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../providers/auth_providers.dart';
import '../../../providers/settings_providers.dart';
import '../../../providers/subscription_providers.dart';
import '../../../routing/routes.dart';
import '../../../ui/cards/veldar_card.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/settings_tile.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  Future<void> _confirmSignOut(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign out?'),
        content: const Text(
          'Any running trip keeps going on the server. You can sign back in '
          'to pick it up.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Sign out',
              style: TextStyle(color: context.palette.danger),
            ),
          ),
        ],
      ),
    );
    if (confirmed ?? false) {
      await ref.read(signInControllerProvider.notifier).signOut();
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final user = ref.watch(currentUserProvider);
    final policy = ref.watch(tierPolicyProvider);
    final themeMode = ref.watch(themeModeProvider);

    return VeldarScaffold(
      title: 'Profile',
      extraBottomInset: Insets.bottomBarClearance,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Reveal(
            child: VeldarCard(
              child: Row(
                children: [
                  _Avatar(
                    url: user?.photoURL,
                    initial: _initialOf(user?.displayName, user?.email),
                  ),
                  const SizedBox(width: Insets.lg),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.displayName ?? 'Traveller',
                          style: text.titleLarge,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? 'Not signed in',
                          style: text.bodySmall!.copyWith(color: p.muted),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: Insets.xxl),

          Reveal(
            delay: const Duration(milliseconds: 80),
            child: SettingsGroup(
              title: 'Account',
              children: [
                SettingsTile(
                  icon: Icons.workspace_premium_outlined,
                  label: 'Subscription',
                  subtitle: policy.capLabel,
                  trailingText: policy.name,
                  onTap: () => context.push(Routes.subscription),
                ),
                SettingsTile(
                  icon: Icons.manage_accounts_outlined,
                  label: 'Account settings',
                  onTap: () => context.push(Routes.account),
                ),
                SettingsTile(
                  icon: Icons.notifications_none,
                  label: 'Notifications',
                  subtitle: 'Approval alerts and trip updates',
                  onTap: () => context.push(Routes.notifications),
                ),
              ],
            ),
          ),
          const SizedBox(height: Insets.xxl),

          Reveal(
            delay: const Duration(milliseconds: 140),
            child: SettingsGroup(
              title: 'Appearance',
              children: [
                for (final mode in ThemeMode.values)
                  SettingsTile(
                    icon: switch (mode) {
                      ThemeMode.system => Icons.brightness_auto_outlined,
                      ThemeMode.light => Icons.light_mode_outlined,
                      ThemeMode.dark => Icons.dark_mode_outlined,
                    },
                    label: switch (mode) {
                      ThemeMode.system => 'Match system',
                      ThemeMode.light => 'Light',
                      ThemeMode.dark => 'Dark',
                    },
                    trailingText: themeMode == mode ? 'Selected' : null,
                    onTap: () =>
                        ref.read(themeModeProvider.notifier).set(mode),
                  ),
              ],
            ),
          ),
          const SizedBox(height: Insets.xxl),

          Reveal(
            delay: const Duration(milliseconds: 200),
            child: SettingsGroup(
              title: 'Veldar',
              children: [
                SettingsTile(
                  icon: Icons.storefront_outlined,
                  label: 'Provider marketplace',
                  subtitle: 'Who Veldar buys from, and their live status',
                  onTap: () => context.push(Routes.providers),
                ),
                SettingsTile(
                  icon: Icons.info_outline,
                  label: 'About',
                  onTap: () => context.push(Routes.about),
                ),
                if (kDebugMode)
                  SettingsTile(
                    icon: Icons.palette_outlined,
                    label: 'Component gallery',
                    subtitle: 'Debug builds only',
                    onTap: () => context.push(Routes.gallery),
                  ),
              ],
            ),
          ),
          // Sign-out is separated from the settings groups so it is never hit
          // by accident while scanning the list.
          const SizedBox(height: Insets.section),
          Reveal(
            delay: const Duration(milliseconds: 260),
            child: SettingsGroup(
              children: [
                SettingsTile(
                  icon: Icons.logout,
                  label: 'Sign out',
                  destructive: true,
                  onTap: () => _confirmSignOut(context, ref),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _initialOf(String? name, String? email) {
    final source = (name?.trim().isNotEmpty ?? false) ? name! : (email ?? '?');
    return source.isEmpty ? '?' : source[0].toUpperCase();
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({this.url, required this.initial});

  final String? url;
  final String initial;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    return Container(
      height: 56,
      width: 56,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: p.tintOf(p.cta),
        borderRadius: Radii.pillShape,
        border: Border.all(color: p.border),
        image: url == null
            ? null
            : DecorationImage(image: NetworkImage(url!), fit: BoxFit.cover),
      ),
      child: url != null
          ? null
          : Text(
              initial,
              style: Theme.of(
                context,
              ).textTheme.titleLarge!.copyWith(color: p.cta),
            ),
    );
  }
}
