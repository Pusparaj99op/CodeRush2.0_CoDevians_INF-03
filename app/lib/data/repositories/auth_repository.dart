import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../../core/config/env.dart';

/// Raised when sign-in fails for a reason worth showing the user.
class AuthFailure implements Exception {
  const AuthFailure(this.message, {this.isConfigIssue = false});

  final String message;

  /// True when the cause is missing Firebase/OAuth configuration rather than
  /// anything the user did — the UI says so plainly instead of telling them to
  /// try again, which would never work.
  final bool isConfigIssue;

  @override
  String toString() => message;
}

/// Firebase Authentication with Google sign-in, matching the website's
/// `components/google-button.tsx` flow against the same Firebase project.
class AuthRepository {
  AuthRepository({FirebaseAuth? auth, GoogleSignIn? google})
    : _auth = auth ?? FirebaseAuth.instance,
      _google =
          google ??
          GoogleSignIn(
            scopes: const ['email', 'profile'],
            // Android reads the OAuth client from google-services.json; iOS and
            // web need it passed explicitly. Null when unset so google_sign_in
            // falls back to the plist rather than failing on an empty string.
            serverClientId: Env.hasGoogleServerClientId
                ? Env.googleServerClientId
                : null,
          );

  final FirebaseAuth _auth;
  final GoogleSignIn _google;

  Stream<User?> get authStateChanges => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  /// The bearer token for every backend call.
  ///
  /// Firebase caches this and refreshes it about five minutes before expiry, so
  /// calling it per-request is cheap. [forceRefresh] is for the single retry
  /// after a 401.
  Future<String?> idToken({bool forceRefresh = false}) =>
      _auth.currentUser?.getIdToken(forceRefresh) ?? Future.value(null);

  Future<UserCredential> signInWithGoogle() async {
    try {
      final account = await _google.signIn();
      // Null means the user dismissed the account picker. That is a normal
      // outcome, not an error to surface as a failure banner.
      if (account == null) {
        throw const AuthFailure('Sign-in cancelled.');
      }

      final googleAuth = await account.authentication;
      if (googleAuth.idToken == null && googleAuth.accessToken == null) {
        throw const AuthFailure(
          'Google did not return a credential. Check that an OAuth client is '
          'registered for this app in the Firebase console.',
          isConfigIssue: true,
        );
      }

      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
        accessToken: googleAuth.accessToken,
      );
      return await _auth.signInWithCredential(credential);
    } on FirebaseAuthException catch (e) {
      throw AuthFailure(_describe(e));
    } on AuthFailure {
      rethrow;
    } catch (e) {
      // PlatformException code 10 is the one everyone hits: the app's SHA-1 is
      // not registered against the Firebase Android app, so google-services.json
      // carries an empty oauth_client list. Saying "try again" would be a lie.
      final s = e.toString();
      if (s.contains('ApiException: 10') || s.contains('DEVELOPER_ERROR')) {
        throw const AuthFailure(
          'Google Sign-In is not configured for this build. The app\'s SHA-1 '
          'fingerprint needs to be registered in the Firebase console.',
          isConfigIssue: true,
        );
      }
      throw AuthFailure('Could not sign in: $s');
    }
  }

  /// Signs out of both Firebase and Google, so the next sign-in shows the
  /// account picker rather than silently reusing the last account.
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _google.signOut().catchError((_) => null),
    ]);
  }

  Future<void> deleteAccount() async {
    final user = _auth.currentUser;
    if (user == null) return;
    try {
      await user.delete();
    } on FirebaseAuthException catch (e) {
      if (e.code == 'requires-recent-login') {
        throw const AuthFailure(
          'For security, sign in again before deleting your account.',
        );
      }
      throw AuthFailure(_describe(e));
    }
  }

  static String _describe(FirebaseAuthException e) => switch (e.code) {
    'account-exists-with-different-credential' =>
      'An account already exists with this email using a different sign-in method.',
    'invalid-credential' => 'That credential was rejected. Try signing in again.',
    'user-disabled' => 'This account has been disabled.',
    'network-request-failed' =>
      'No connection. Check your network and try again.',
    'operation-not-allowed' =>
      'Google sign-in is not enabled for this Firebase project.',
    _ => e.message ?? 'Sign-in failed (${e.code}).',
  };
}
