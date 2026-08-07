import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../providers/auth_providers.dart';
import '../../../providers/settings_providers.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/settings_tile.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    // Deleting is irreversible, so it needs an explicit confirmation and a
    // clear statement of what is lost — not just an "are you sure".
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete account?'),
        content: const Text(
          'This removes your Veldar sign-in permanently. Your trip history and '
          'settlement receipts stay on the ledger, because the audit trail '
          'cannot be rewritten.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep my account'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              'Delete',
              style: TextStyle(color: context.palette.danger),
            ),
          ),
        ],
      ),
    );
    if (!(confirmed ?? false)) return;

    try {
      await ref.read(authRepositoryProvider).deleteAccount();
    } on AuthFailure catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return VeldarScaffold(
      title: 'Account',
      showBackButton: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: Insets.sm),
          Reveal(
            child: SettingsGroup(
              title: 'Signed in as',
              children: [
                SettingsTile(
                  icon: Icons.alternate_email,
                  label: user?.email ?? 'Unknown',
                  subtitle: 'Google account',
                ),
                SettingsTile(
                  icon: Icons.badge_outlined,
                  label: 'Display name',
                  trailingText: user?.displayName ?? '—',
                ),
                SettingsTile(
                  icon: Icons.fingerprint,
                  label: 'User ID',
                  subtitle: user?.uid ?? '—',
                ),
              ],
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Reveal(
            delay: const Duration(milliseconds: 80),
            child: SettingsGroup(
              title: 'Data',
              children: [
                SettingsTile(
                  icon: Icons.restart_alt,
                  label: 'Redo onboarding',
                  subtitle: 'Pick your plan again',
                  onTap: () =>
                      ref.read(onboardingCompleteProvider.notifier).reset(),
                ),
              ],
            ),
          ),
          const SizedBox(height: Insets.section),
          const Reveal(
            delay: Duration(milliseconds: 140),
            child: InlineBanner(
              message:
                  'Veldar never holds your private keys. Signing is delegated '
                  'to the facilitator, so the app itself is not a custody risk.',
              tone: BannerTone.info,
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Reveal(
            delay: const Duration(milliseconds: 200),
            child: SettingsGroup(
              children: [
                SettingsTile(
                  icon: Icons.delete_outline,
                  label: 'Delete account',
                  destructive: true,
                  onTap: () => _confirmDelete(context, ref),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
