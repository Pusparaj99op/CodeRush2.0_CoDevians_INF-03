import 'package:flutter/material.dart';

import '../../../core/theme/veldar_spacing.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';

/// Live workflow traces and anything blocked on the user's approval.
///
/// This is the screen the approval push notification deep-links past — it
/// exists so a user who missed the notification still has one place to find
/// what the agent is waiting on.
class ActivityPage extends StatelessWidget {
  const ActivityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const VeldarScaffold(
      title: 'Activity',
      scrollable: false,
      extraBottomInset: Insets.bottomBarClearance,
      child: EmptyState(
        icon: Icons.bolt_outlined,
        title: 'Nothing running',
        message:
            'When Veldar is working on a trip you will see every quote, '
            'payment and approval here as it happens.',
      ),
    );
  }
}
