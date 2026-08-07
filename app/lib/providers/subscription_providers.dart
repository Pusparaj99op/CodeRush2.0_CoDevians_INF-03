import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/tier.dart';
import 'settings_providers.dart';

const _kTier = 'tier';

/// The user's chosen tier.
///
/// Cached locally so the UI can show the right cap immediately, but it is only
/// a hint: the tier travels with `POST /api/workflows` and the orchestrator
/// re-applies `TIER_CAPS` server-side, so editing this value buys no extra
/// spending autonomy.
class TierController extends Notifier<Tier> {
  @override
  Tier build() =>
      Tier.fromWire(ref.read(sharedPreferencesProvider).getString(_kTier));

  Future<void> set(Tier tier) async {
    state = tier;
    await ref.read(sharedPreferencesProvider).setString(_kTier, tier.wire);
  }
}

final tierProvider = NotifierProvider<TierController, Tier>(
  TierController.new,
);

final tierPolicyProvider = Provider<TierPolicy>((ref) {
  return TierPolicy.of(ref.watch(tierProvider));
});
