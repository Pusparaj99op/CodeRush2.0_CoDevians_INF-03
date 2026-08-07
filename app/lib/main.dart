import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/theme/veldar_colors.dart';
import 'providers/settings_providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      systemNavigationBarColor: Colors.transparent,
    ),
  );

  // Loaded before runApp so the theme preference is available synchronously and
  // the first frame is already in the right palette — no light-to-dark flash.
  final prefs = await SharedPreferences.getInstance();

  // Android reads android/app/google-services.json and iOS reads
  // GoogleService-Info.plist. A missing plist is expected until an iOS app is
  // registered in the Firebase console, so it must not take the whole app down
  // — the UI stays browsable and sign-in reports the real reason.
  Object? firebaseError;
  try {
    await Firebase.initializeApp();
  } catch (e, s) {
    firebaseError = e;
    debugPrint('Firebase init failed: $e\n$s');
  }

  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: firebaseError == null
          ? const VeldarApp()
          : _FirebaseSetupNeeded(error: firebaseError),
    ),
  );
}

/// Shown only when Firebase itself could not start. Says what to fix rather
/// than dropping the user on a blank screen.
class _FirebaseSetupNeeded extends StatelessWidget {
  const _FirebaseSetupNeeded({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        backgroundColor: VeldarColors.bgDark,
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.settings_suggest_outlined,
                  color: VeldarColors.cta,
                  size: 40,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Firebase is not configured for this platform.',
                  style: TextStyle(
                    color: VeldarColors.headlineDark,
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Android needs android/app/google-services.json and iOS '
                  'needs ios/Runner/GoogleService-Info.plist, both from the '
                  'Firebase project com-example-veldar-1426b.',
                  style: TextStyle(color: VeldarColors.bodyDark),
                ),
                const SizedBox(height: 16),
                Text(
                  '$error',
                  style: const TextStyle(
                    color: VeldarColors.mutedDark,
                    fontSize: 12,
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
