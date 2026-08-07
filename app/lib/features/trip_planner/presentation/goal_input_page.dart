import 'package:flutter/material.dart';

import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';

/// Trip goal entry.
///
/// Phase 1 placeholder: the real form, budget slider and
/// `POST /api/workflows` submission land in phase 2 alongside the backend's
/// travel compiler. Shipping the route now keeps the navigation graph and the
/// home screen's primary CTA honest.
class GoalInputPage extends StatelessWidget {
  const GoalInputPage({super.key, this.initialGoal});

  final String? initialGoal;

  @override
  Widget build(BuildContext context) {
    return VeldarScaffold(
      title: 'Plan a trip',
      showBackButton: true,
      scrollable: false,
      child: EmptyState(
        icon: Icons.travel_explore,
        title: 'Trip planning arrives next',
        message:
            'The goal parser and provider marketplace are being wired up on '
            'the backend. This screen becomes the goal input as soon as they '
            'land.',
        actionLabel: 'Back',
        onAction: () => Navigator.of(context).maybePop(),
      ),
    );
  }
}
