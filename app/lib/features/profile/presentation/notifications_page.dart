import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/veldar_spacing.dart';
import '../../../providers/settings_providers.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/settings_tile.dart';

/// Notification preferences.
///
/// Approval alerts are deliberately not switchable: the agent blocks mid-trip
/// waiting for one, and silently stalling a booking would be worse than an
/// unwanted notification. Everything else is opt-out.
class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  static const kTripUpdates = 'notify_trip_updates';
  static const kReceipts = 'notify_receipts';

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  late bool _tripUpdates;
  late bool _receipts;

  @override
  void initState() {
    super.initState();
    final prefs = ref.read(sharedPreferencesProvider);
    _tripUpdates = prefs.getBool(NotificationsPage.kTripUpdates) ?? true;
    _receipts = prefs.getBool(NotificationsPage.kReceipts) ?? true;
  }

  Future<void> _set(String key, bool value) async {
    // Optimistic: the switch tracks the finger immediately, and the write is
    // to local storage so it cannot realistically fail out from under us.
    setState(() {
      if (key == NotificationsPage.kTripUpdates) {
        _tripUpdates = value;
      } else {
        _receipts = value;
      }
    });
    await ref.read(sharedPreferencesProvider).setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    return VeldarScaffold(
      title: 'Notifications',
      showBackButton: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: Insets.sm),
          const Reveal(
            child: InlineBanner(
              message:
                  'Approval alerts cannot be turned off. Veldar pauses a trip '
                  'until you decide, so you need to know it is waiting.',
              tone: BannerTone.warning,
            ),
          ),
          const SizedBox(height: Insets.xxl),
          Reveal(
            delay: const Duration(milliseconds: 80),
            child: SettingsGroup(
              title: 'Alerts',
              children: [
                const SettingsTile(
                  icon: Icons.pan_tool_outlined,
                  label: 'Approval needed',
                  subtitle: 'Always on',
                  trailingText: 'Required',
                ),
                SettingsTile(
                  icon: Icons.flight_takeoff,
                  label: 'Trip updates',
                  subtitle: 'Bookings confirmed, steps skipped',
                  value: _tripUpdates,
                  onChanged: (v) => _set(NotificationsPage.kTripUpdates, v),
                ),
                SettingsTile(
                  icon: Icons.receipt_outlined,
                  label: 'Payment receipts',
                  subtitle: 'Each settlement on TestNet',
                  value: _receipts,
                  onChanged: (v) => _set(NotificationsPage.kReceipts, v),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
