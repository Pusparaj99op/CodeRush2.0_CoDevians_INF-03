import 'package:flutter/material.dart';

import '../../../ui/feedback/state_views.dart';
import '../../../ui/layout/veldar_scaffold.dart';

/// The provider marketplace with live health status, backed by
/// `GET /api/providers`. Wired in phase 2 once the travel providers exist.
class ProvidersPage extends StatelessWidget {
  const ProvidersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const VeldarScaffold(
      title: 'Providers',
      showBackButton: true,
      scrollable: false,
      child: EmptyState(
        icon: Icons.storefront_outlined,
        title: 'Marketplace loading soon',
        message:
            'This will list every provider Veldar can buy from, what it '
            'charges per call, and whether it is online right now.',
      ),
    );
  }
}
