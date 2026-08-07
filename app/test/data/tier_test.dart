import 'package:flutter_test/flutter_test.dart';
import 'package:veldar_travel/data/models/tier.dart';

void main() {
  group('Tier wire format', () {
    test('matches website/lib/types.ts exactly', () {
      expect(Tier.free.wire, 'free');
      expect(Tier.pro.wire, 'pro');
      expect(Tier.promax.wire, 'promax');
    });

    test('round-trips', () {
      for (final t in Tier.values) {
        expect(Tier.fromWire(t.wire), t);
      }
    });

    test('falls back to the most restrictive tier on unknown input', () {
      // Guessing high would let the UI promise autonomy the server denies.
      expect(Tier.fromWire(null), Tier.free);
      expect(Tier.fromWire(''), Tier.free);
      expect(Tier.fromWire('enterprise'), Tier.free);
      expect(Tier.fromWire('PRO'), Tier.free);
    });
  });

  group('TierPolicy mirrors TIER_CAPS', () {
    test('caps', () {
      expect(TierPolicy.of(Tier.free).perTxnCapAlgo, 0.5);
      expect(TierPolicy.of(Tier.pro).perTxnCapAlgo, 5);
      expect(TierPolicy.of(Tier.promax).perTxnCapAlgo, isNull);
    });

    test('platform cut in basis points', () {
      expect(TierPolicy.of(Tier.free).platformCutBps, 250);
      expect(TierPolicy.of(Tier.pro).platformCutBps, 100);
      expect(TierPolicy.of(Tier.promax).platformCutBps, 0);
    });

    test('labels match the website copy', () {
      expect(TierPolicy.of(Tier.free).capLabel, '0.5 ALGO cap per step');
      expect(TierPolicy.of(Tier.pro).capLabel, '5.0 ALGO cap per step');
      expect(TierPolicy.of(Tier.promax).capLabel, 'No per-step cap');

      expect(
        TierPolicy.of(Tier.free).cutLabel,
        '2.5% cut per transaction',
      );
      expect(TierPolicy.of(Tier.pro).cutLabel, '1.0% cut per transaction');
      expect(TierPolicy.of(Tier.promax).cutLabel, 'No platform cut');
    });

    test('exactly one tier is featured', () {
      expect(TierPolicy.all.where((t) => t.featured).length, 1);
    });

    test('every tier has a policy', () {
      for (final t in Tier.values) {
        expect(() => TierPolicy.of(t), returnsNormally);
      }
    });
  });
}
