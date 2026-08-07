import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_spacing.dart';
import '../../../routing/routes.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';

/// Past and in-flight trips. Wired to `GET /api/workflows` in phase 2; until
/// then it renders the empty state, which is the correct view for a new
/// account anyway.
class TripsPage extends StatelessWidget {
  const TripsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return VeldarScaffold(
      title: 'Trips',
      scrollable: false,
      extraBottomInset: Insets.bottomBarClearance,
      child: EmptyState(
        icon: Icons.luggage_outlined,
        title: 'No trips yet',
        message:
            'Tell Veldar where you want to go and it will plan, price and '
            'book the whole thing.',
        actionLabel: 'Plan a trip',
        onAction: () => context.push(Routes.plan),
      ),
    );
  }
}
