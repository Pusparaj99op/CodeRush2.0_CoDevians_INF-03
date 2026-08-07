import 'package:flutter_test/flutter_test.dart';
import 'package:veldar_travel/core/utils/algo_format.dart';

void main() {
  group('algo()', () {
    test('drops trailing zeros so a quote does not imply false precision', () {
      expect(AlgoFormat.algo(2.5), '2.5 ALGO');
      expect(AlgoFormat.algo(1), '1 ALGO');
      expect(AlgoFormat.algo(0.5), '0.5 ALGO');
    });

    test('keeps three decimals and groups thousands', () {
      expect(AlgoFormat.algo(0.125), '0.125 ALGO');
      expect(AlgoFormat.algo(1234.5), '1,234.5 ALGO');
    });
  });

  group('micro conversion', () {
    test('round-trips the tier cap boundaries exactly', () {
      // 0.5 and 5.0 are the free and pro caps; an off-by-one here would fail
      // the facilitator's `exact` scheme comparison.
      for (final v in [0.5, 5.0, 2.5, 1.0, 3.0, 0.25, 0.4, 6.0]) {
        expect(AlgoFormat.fromMicro(AlgoFormat.toMicro(v)), v, reason: '$v');
      }
    });

    test('matches the backend rounding rule', () {
      expect(AlgoFormat.toMicro(2.5), 2500000);
      expect(AlgoFormat.toMicro(0.000001), 1);
      // Rounds rather than truncates, same as round(amountAlgo * 1e6).
      expect(AlgoFormat.toMicro(0.0000015), 2);
    });

    test('does not round twice through a format round-trip', () {
      const micro = 2500001;
      expect(AlgoFormat.toMicro(AlgoFormat.fromMicro(micro)), micro);
    });
  });

  group('progress()', () {
    test('is the spent fraction of budget', () {
      expect(AlgoFormat.progress(3, 12), closeTo(0.25, 1e-9));
    });

    test('clamps rather than exceeding one when spend overruns', () {
      expect(AlgoFormat.progress(20, 12), 1.0);
    });

    test('guards a zero or negative budget instead of dividing by it', () {
      expect(AlgoFormat.progress(5, 0), 0);
      expect(AlgoFormat.progress(5, -1), 0);
    });
  });

  test('usd() always shows two decimals for plan prices', () {
    expect(AlgoFormat.usd(12), r'$12.00');
    expect(AlgoFormat.usd(0), r'$0.00');
  });
}
