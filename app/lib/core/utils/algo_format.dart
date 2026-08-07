import 'package:intl/intl.dart';

/// Formatting for ALGO amounts.
///
/// The backend speaks whole ALGO as doubles (`priceAlgo`, `budgetAlgo`,
/// `spentAlgo`) and micro-ALGO as ints on the wire to the facilitator
/// (`amountMicroAlgos`). Conversion happens here and nowhere else, so a
/// rounding rule never gets applied twice.
abstract final class AlgoFormat {
  static const microPerAlgo = 1000000;

  static final _amount = NumberFormat('#,##0.###');
  static final _fiat = NumberFormat('#,##0.00');

  /// `2.5` -> `"2.5 ALGO"`. Up to three decimals, trailing zeros dropped —
  /// "2.500 ALGO" reads like false precision on a quote.
  static String algo(num value) => '${_amount.format(value)} ALGO';

  /// The bare number, for when the unit is already in the surrounding label.
  static String bare(num value) => _amount.format(value);

  /// Micro-ALGO int -> ALGO double. Exact: the backend computes
  /// `round(amountAlgo * 1_000_000)`, so this is its inverse.
  static double fromMicro(int micro) => micro / microPerAlgo;

  /// ALGO double -> micro-ALGO int, rounding the same way the facilitator does
  /// in `website/lib/facilitator.ts`. Rounding anywhere else risks an
  /// off-by-one that fails `exact`-scheme verification.
  static int toMicro(double algo) => (algo * microPerAlgo).round();

  /// `"$12.00"`. Subscription prices only — never balances.
  static String usd(num value) => '\$${_fiat.format(value)}';

  /// Remaining budget as a 0..1 fraction, clamped. Guards a zero budget, which
  /// the API rejects on create but which an older cached document may hold.
  static double progress(num spent, num budget) {
    if (budget <= 0) return 0;
    final v = spent / budget;
    return v.clamp(0.0, 1.0).toDouble();
  }
}
