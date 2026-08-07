import 'routes.dart';

/// The inputs a redirect decision depends on. Kept as a plain value type so
/// the rule below is a pure function and can be unit-tested without Firebase,
/// Riverpod or a widget tree.
class AuthGate {
  const AuthGate({
    required this.resolved,
    required this.signedIn,
    required this.onboardingComplete,
  });

  /// False until Firebase has reported its first auth state.
  final bool resolved;
  final bool signedIn;
  final bool onboardingComplete;
}

/// Returns the path to redirect to, or null to stay put.
///
/// Rules, in order:
/// 1. While auth is unresolved everything holds on the splash screen —
///    redirecting earlier bounces a returning user to sign-in for a frame.
/// 2. Signed out: only onboarding is reachable. The intended destination is
///    preserved as `?from=` so sign-in can return the user to it.
/// 3. Signed in but no tier chosen yet: onboarding must finish first, because
///    the tier decides the approval policy for every workflow.
/// 4. Signed in and onboarded: onboarding and splash are no longer reachable.
String? resolveRedirect(AuthGate gate, String location) {
  if (!gate.resolved) {
    return location == Routes.splash ? null : Routes.splash;
  }

  if (!gate.signedIn) {
    if (Routes.isPublic(location) && location != Routes.splash) return null;
    if (location == Routes.splash) return Routes.welcome;
    return '${Routes.signIn}?from=${Uri.encodeComponent(location)}';
  }

  if (!gate.onboardingComplete) {
    return location == Routes.tierSelect ? null : Routes.tierSelect;
  }

  if (Routes.isPublic(location)) return Routes.home;

  return null;
}
