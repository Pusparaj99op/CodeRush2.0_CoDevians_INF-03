import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/veldar_motion.dart';
import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../routing/routes.dart';

class _Tab {
  const _Tab(this.path, this.label, this.icon, this.activeIcon);
  final String path;
  final String label;
  final IconData icon;
  final IconData activeIcon;
}

/// Five top-level destinations — the Material maximum before labels start
/// getting squeezed. Anything deeper lives inside a tab, never in the bar.
const _tabs = <_Tab>[
  _Tab(Routes.home, 'Home', Icons.explore_outlined, Icons.explore),
  _Tab(Routes.trips, 'Trips', Icons.luggage_outlined, Icons.luggage),
  _Tab(
    Routes.activity,
    'Activity',
    Icons.bolt_outlined,
    Icons.bolt,
  ),
  _Tab(
    Routes.wallet,
    'Wallet',
    Icons.account_balance_wallet_outlined,
    Icons.account_balance_wallet,
  ),
  _Tab(Routes.profile, 'Profile', Icons.person_outline, Icons.person),
];

/// Persistent tab scaffold. [StatefulNavigationShell] keeps each tab's own
/// navigation stack and scroll position alive, so switching away and back does
/// not reset where the user was.
class RootShell extends StatelessWidget {
  const RootShell({super.key, required this.navigationShell, this.badgeCount = 0});

  final StatefulNavigationShell navigationShell;

  /// Pending approvals, shown on the Activity tab. An agent blocked on approval
  /// is the one thing in this app that is genuinely urgent.
  final int badgeCount;

  void _onTap(int index) {
    // Tapping the active tab pops it back to its root, the standard iOS and
    // Android behaviour.
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: p.bg,
      body: navigationShell,
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          color: p.bgElevated,
          border: Border(top: BorderSide(color: p.border)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            // 60 plus the safe-area inset keeps every tap target above the
            // 48dp floor even with a large system font.
            height: 60,
            child: Row(
              children: [
                for (var i = 0; i < _tabs.length; i++)
                  Expanded(
                    child: _TabButton(
                      tab: _tabs[i],
                      selected: navigationShell.currentIndex == i,
                      badge: _tabs[i].path == Routes.activity ? badgeCount : 0,
                      textStyle: text.labelSmall!,
                      onTap: () => _onTap(i),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.tab,
    required this.selected,
    required this.badge,
    required this.textStyle,
    required this.onTap,
  });

  final _Tab tab;
  final bool selected;
  final int badge;
  final TextStyle textStyle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final p = context.palette;
    final color = selected ? p.cta : p.muted;

    return Semantics(
      button: true,
      selected: selected,
      label: tab.label,
      hint: badge > 0 ? '$badge pending' : null,
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                AnimatedSwitcher(
                  duration: Motion.scaled(context, Motion.quick),
                  child: Icon(
                    selected ? tab.activeIcon : tab.icon,
                    key: ValueKey(selected),
                    size: IconSizes.lg,
                    color: color,
                  ),
                ),
                if (badge > 0)
                  Positioned(
                    right: -6,
                    top: -3,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5),
                      constraints: const BoxConstraints(minWidth: 16),
                      height: 16,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: p.cta,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: p.bgElevated, width: 1.5),
                      ),
                      child: Text(
                        badge > 9 ? '9+' : '$badge',
                        style: textStyle.copyWith(
                          color: p.onCta,
                          fontSize: 10,
                          letterSpacing: 0,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            // Labels always visible: an icon-only bar makes destinations
            // guessable rather than readable.
            Text(
              tab.label,
              style: textStyle.copyWith(
                color: color,
                letterSpacing: 0.2,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
