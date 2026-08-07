/// Every route path and name in one place, so no screen builds a URL by hand.
abstract final class Routes {
  static const splash = '/splash';

  // Onboarding
  static const welcome = '/onboarding/welcome';
  static const signIn = '/onboarding/signin';
  static const tierSelect = '/onboarding/tier';

  // Tabs
  static const home = '/home';
  static const trips = '/trips';
  static const wallet = '/wallet';
  static const activity = '/activity';
  static const profile = '/profile';

  // Trips
  static const tripDetail = '/trips/:workflowId';
  static String tripDetailOf(String id) => '/trips/$id';

  // Planner
  static const plan = '/plan';
  static const planPreview = '/plan/preview';

  // Trace + approvals (also the push-notification deep-link targets)
  static const trace = '/trace/:workflowId';
  static String traceOf(String id) => '/trace/$id';
  static const traceApprove = '/trace/:workflowId/approve/:approvalId';
  static String traceApproveOf(String workflowId, String approvalId) =>
      '/trace/$workflowId/approve/$approvalId';

  // Wallet
  static const transactions = '/wallet/transactions';

  // Profile
  static const account = '/profile/account';
  static const notifications = '/profile/notifications';
  static const subscription = '/profile/subscription';
  static const about = '/profile/about';

  static const providers = '/providers';

  /// Debug-only component gallery. Not reachable from the UI in release.
  static const gallery = '/dev/gallery';

  /// Paths a signed-out user may visit.
  static const publicPrefixes = <String>['/onboarding', '/splash'];

  static bool isPublic(String location) =>
      publicPrefixes.any(location.startsWith);
}
