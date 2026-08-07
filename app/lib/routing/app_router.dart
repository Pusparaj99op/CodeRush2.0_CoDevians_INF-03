import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/veldar_motion.dart';
import '../features/approvals/presentation/activity_page.dart';
import '../features/dev/presentation/gallery_page.dart';
import '../features/home/presentation/home_page.dart';
import '../features/onboarding/presentation/sign_in_page.dart';
import '../features/onboarding/presentation/splash_page.dart';
import '../features/onboarding/presentation/tier_select_page.dart';
import '../features/onboarding/presentation/welcome_page.dart';
import '../features/profile/presentation/about_page.dart';
import '../features/profile/presentation/account_page.dart';
import '../features/profile/presentation/notifications_page.dart';
import '../features/profile/presentation/profile_page.dart';
import '../features/providers_market/presentation/providers_page.dart';
import '../features/shell/presentation/root_shell.dart';
import '../features/subscription/presentation/subscription_page.dart';
import '../features/trip_planner/presentation/goal_input_page.dart';
import '../features/trips/presentation/trips_page.dart';
import '../features/wallet/presentation/wallet_page.dart';
import '../providers/auth_providers.dart';
import '../providers/settings_providers.dart';
import 'guards.dart';
import 'routes.dart';

final _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');

/// Bridges Riverpod to go_router, which needs a [Listenable] rather than a
/// provider subscription. Without this the redirect only re-runs on navigation,
/// so signing out would leave the user sitting on a protected screen.
class _GoRouterRefresh extends ChangeNotifier {
  _GoRouterRefresh(this._ref) {
    _ref.listen(authStateProvider, (_, _) => notifyListeners());
    _ref.listen(onboardingCompleteProvider, (_, _) => notifyListeners());
  }

  final Ref _ref;
}

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = _GoRouterRefresh(ref);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: Routes.splash,
    debugLogDiagnostics: kDebugMode,
    refreshListenable: refresh,
    redirect: (context, state) {
      final gate = AuthGate(
        resolved: ref.read(authResolvedProvider),
        signedIn: ref.read(isSignedInProvider),
        onboardingComplete: ref.read(onboardingCompleteProvider),
      );
      return resolveRedirect(gate, state.matchedLocation);
    },
    routes: [
      GoRoute(
        path: Routes.splash,
        builder: (_, _) => const SplashPage(),
      ),
      GoRoute(
        path: Routes.welcome,
        builder: (_, _) => const WelcomePage(),
      ),
      GoRoute(
        path: Routes.signIn,
        builder: (_, _) => const SignInPage(),
      ),
      GoRoute(
        path: Routes.tierSelect,
        builder: (_, _) => const TierSelectPage(),
      ),

      // The five tabs. Each branch keeps its own navigator, so a tab's back
      // stack and scroll position survive switching away and back.
      StatefulShellRoute.indexedStack(
        builder: (_, _, shell) => RootShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: Routes.home,
                builder: (_, _) => const HomePage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: Routes.trips,
                builder: (_, _) => const TripsPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: Routes.activity,
                builder: (_, _) => const ActivityPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: Routes.wallet,
                builder: (_, _) => const WalletPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: Routes.profile,
                builder: (_, _) => const ProfilePage(),
              ),
            ],
          ),
        ],
      ),

      // Pushed over the shell, so the tab bar is hidden while planning.
      GoRoute(
        path: Routes.plan,
        parentNavigatorKey: _rootKey,
        pageBuilder: (context, state) => _slideUp(
          context,
          state,
          GoalInputPage(initialGoal: state.uri.queryParameters['goal']),
        ),
      ),
      GoRoute(
        path: Routes.subscription,
        parentNavigatorKey: _rootKey,
        builder: (_, _) => const SubscriptionPage(),
      ),
      GoRoute(
        path: Routes.account,
        parentNavigatorKey: _rootKey,
        builder: (_, _) => const AccountPage(),
      ),
      GoRoute(
        path: Routes.notifications,
        parentNavigatorKey: _rootKey,
        builder: (_, _) => const NotificationsPage(),
      ),
      GoRoute(
        path: Routes.about,
        parentNavigatorKey: _rootKey,
        builder: (_, _) => const AboutPage(),
      ),
      GoRoute(
        path: Routes.providers,
        parentNavigatorKey: _rootKey,
        builder: (_, _) => const ProvidersPage(),
      ),
      if (kDebugMode)
        GoRoute(
          path: Routes.gallery,
          parentNavigatorKey: _rootKey,
          builder: (_, _) => const GalleryPage(),
        ),
    ],
    errorBuilder: (context, state) => _NotFound(location: state.uri.toString()),
  );
});

/// Modal-style transition for a full-screen task pushed over the tabs. Entering
/// from below reads as "deeper", which is what a task sheet is.
CustomTransitionPage<void> _slideUp(
  BuildContext context,
  GoRouterState state,
  Widget child,
) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: Motion.scaled(context, Motion.route),
    reverseTransitionDuration: Motion.scaled(context, Motion.exit),
    transitionsBuilder: (context, animation, _, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Motion.enterCurve,
        reverseCurve: Curves.easeIn,
      );
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween(
            begin: const Offset(0, 0.06),
            end: Offset.zero,
          ).animate(curved),
          child: child,
        ),
      );
    },
  );
}

class _NotFound extends StatelessWidget {
  const _NotFound({required this.location});

  final String location;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('That page does not exist.'),
              const SizedBox(height: 8),
              Text(location, textAlign: TextAlign.center),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.go(Routes.home),
                child: const Text('Go home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
