/// Build-time configuration.
///
/// Pass overrides with `--dart-define`, e.g.
/// `flutter run --dart-define=VELDAR_API_BASE_URL=http://10.0.2.2:3000`
/// (10.0.2.2 is the host machine as seen from an Android emulator).
abstract final class Env {
  /// Base URL of the Next.js backend that owns the orchestrator, budget policy
  /// and ledger. The app never talks to Algorand or the facilitator directly.
  static const apiBaseUrl = String.fromEnvironment(
    'VELDAR_API_BASE_URL',
    defaultValue: 'https://www.codevians.online',
  );

  /// Google OAuth *web* client id, needed by google_sign_in on iOS and as the
  /// `serverClientId` on Android. Empty until an OAuth client exists in the
  /// Firebase project — see the README's Firebase setup section.
  static const googleServerClientId = String.fromEnvironment(
    'VELDAR_GOOGLE_SERVER_CLIENT_ID',
  );

  static bool get hasGoogleServerClientId => googleServerClientId.isNotEmpty;
}
