import 'package:flutter_test/flutter_test.dart';
import 'package:veldar_travel/routing/guards.dart';
import 'package:veldar_travel/routing/routes.dart';
void main() {
  const unresolved = AuthGate(
    resolved: false,
    signedIn: false,
    onboardingComplete: false,
  );
  const signedOut = AuthGate(
    resolved: true,
    signedIn: false,
    onboardingComplete: false,
  );
  const needsOnboarding = AuthGate(
    resolved: true,
    signedIn: true,
    onboardingComplete: false,
  );
  const ready = AuthGate(
    resolved: true,
    signedIn: true,
    onboardingComplete: true,
  );

  group('while auth is unresolved', () {
    test('holds on splash rather than deciding early', () {
      expect(resolveRedirect(unresolved, Routes.home), Routes.splash);
      expect(resolveRedirect(unresolved, Routes.signIn), Routes.splash);
    });

    test('does not redirect splash to itself', () {
      expect(resolveRedirect(unresolved, Routes.splash), isNull);
    });
  });

  group('signed out', () {
    test('splash advances to welcome', () {
      expect(resolveRedirect(signedOut, Routes.splash), Routes.welcome);
    });

    test('onboarding routes are reachable', () {
      expect(resolveRedirect(signedOut, Routes.welcome), isNull);
      expect(resolveRedirect(signedOut, Routes.signIn), isNull);
    });

    test('protected routes bounce to sign-in', () {
      expect(
        resolveRedirect(signedOut, Routes.home),
        startsWith(Routes.signIn),
      );
      expect(
        resolveRedirect(signedOut, Routes.wallet),
        startsWith(Routes.signIn),
      );
    });

    test('preserves the intended destination for post-login return', () {
      final target = Routes.traceOf('wf_123');
      final redirect = resolveRedirect(signedOut, target)!;
      final from = Uri.parse(redirect).queryParameters['from'];
      expect(from, target);
    });

    test('encodes a destination containing query characters', () {
      const target = '/plan?goal=Goa%20trip';
      final redirect = resolveRedirect(signedOut, target)!;
      // Round-trips exactly — a naively concatenated path would truncate at
      // the inner '?' and drop the goal.
      expect(Uri.parse(redirect).queryParameters['from'], target);
    });
  });

  group('signed in, onboarding incomplete', () {
    test('every route funnels to tier selection', () {
      expect(resolveRedirect(needsOnboarding, Routes.home), Routes.tierSelect);
      expect(resolveRedirect(needsOnboarding, Routes.trips), Routes.tierSelect);
      expect(
        resolveRedirect(needsOnboarding, Routes.signIn),
        Routes.tierSelect,
      );
    });

    test('tier selection itself is not a redirect loop', () {
      expect(resolveRedirect(needsOnboarding, Routes.tierSelect), isNull);
    });
  });

  group('signed in and onboarded', () {
    test('tabs and detail routes are reachable', () {
      for (final r in [
        Routes.home,
        Routes.trips,
        Routes.wallet,
        Routes.activity,
        Routes.profile,
        Routes.subscription,
        Routes.traceOf('wf_1'),
        Routes.tripDetailOf('wf_1'),
      ]) {
        expect(resolveRedirect(ready, r), isNull, reason: r);
      }
    });

    test('onboarding and splash are no longer reachable', () {
      expect(resolveRedirect(ready, Routes.splash), Routes.home);
      expect(resolveRedirect(ready, Routes.welcome), Routes.home);
      expect(resolveRedirect(ready, Routes.signIn), Routes.home);
      expect(resolveRedirect(ready, Routes.tierSelect), Routes.home);
    });
  });

  group('Routes', () {
    test('isPublic covers exactly the onboarding surface', () {
      expect(Routes.isPublic(Routes.welcome), isTrue);
      expect(Routes.isPublic(Routes.signIn), isTrue);
      expect(Routes.isPublic(Routes.tierSelect), isTrue);
      expect(Routes.isPublic(Routes.splash), isTrue);
      expect(Routes.isPublic(Routes.home), isFalse);
      expect(Routes.isPublic(Routes.profile), isFalse);
    });

    test('builders match their pattern paths', () {
      expect(
        Routes.traceOf('wf_1'),
        Routes.trace.replaceAll(':workflowId', 'wf_1'),
      );
      expect(
        Routes.tripDetailOf('wf_1'),
        Routes.tripDetail.replaceAll(':workflowId', 'wf_1'),
      );
      expect(
        Routes.traceApproveOf('wf_1', 'appr_2'),
        Routes.traceApprove
            .replaceAll(':workflowId', 'wf_1')
            .replaceAll(':approvalId', 'appr_2'),
      );
    });
  });
}
