import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Set in `main()` once SharedPreferences has loaded, so the rest of the app
/// can read preferences synchronously and never renders a theme flash.
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('overridden in main()');
});

const _kThemeMode = 'theme_mode';
const _kOnboarded = 'onboarding_complete';

/// Theme preference. Defaults to [ThemeMode.system]; the override is stored so
/// a user who prefers dark app / light OS keeps their choice across launches.
class ThemeModeController extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    final raw = ref.read(sharedPreferencesProvider).getString(_kThemeMode);
    return switch (raw) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
  }

  Future<void> set(ThemeMode mode) async {
    state = mode;
    await ref.read(sharedPreferencesProvider).setString(_kThemeMode, mode.name);
  }
}

final themeModeProvider = NotifierProvider<ThemeModeController, ThemeMode>(
  ThemeModeController.new,
);

/// Whether the user has finished onboarding (picked a tier). Gates the router
/// redirect so a first-time user lands on tier selection rather than the home
/// tab with no tier set.
class OnboardingController extends Notifier<bool> {
  @override
  bool build() =>
      ref.read(sharedPreferencesProvider).getBool(_kOnboarded) ?? false;

  Future<void> complete() async {
    state = true;
    await ref.read(sharedPreferencesProvider).setBool(_kOnboarded, true);
  }

  Future<void> reset() async {
    state = false;
    await ref.read(sharedPreferencesProvider).setBool(_kOnboarded, false);
  }
}

final onboardingCompleteProvider =
    NotifierProvider<OnboardingController, bool>(OnboardingController.new);
