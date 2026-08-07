/// Subscription tier. Mirrors `Tier` in `website/lib/types.ts`.
///
/// The wire values are lowercase; do not rename without changing the backend,
/// because the tier is sent verbatim on `POST /api/workflows`.
enum Tier {
  free('free'),
  pro('pro'),
  promax('promax');

  const Tier(this.wire);

  final String wire;

  static Tier fromWire(String? value) => switch (value) {
    'pro' => Tier.pro,
    'promax' => Tier.promax,
    // Unknown or absent falls back to the most restrictive tier. Guessing high
    // would let the UI imply an autonomy the server will not grant.
    _ => Tier.free,
  };
}

/// The tier policy table, mirroring `TIER_CAPS` in `website/lib/types.ts`.
///
/// This is display only. The orchestrator enforces the same numbers server-side
/// in `quoteStep()`, so a modified client cannot buy itself more autonomy.
class TierPolicy {
  const TierPolicy({
    required this.tier,
    required this.name,
    required this.priceLabel,
    required this.perTxnCapAlgo,
    required this.platformCutBps,
    required this.tagline,
    required this.features,
    required this.approvalSummary,
    this.featured = false,
  });

  final Tier tier;
  final String name;
  final String priceLabel;

  /// Per-transaction spend cap. Null means unlimited.
  final double? perTxnCapAlgo;

  /// Platform cut in basis points. 250 = 2.5%.
  final int platformCutBps;

  final String tagline;
  final List<String> features;
  final String approvalSummary;
  final bool featured;

  /// The website's `tierCapLabel` in `website/lib/content.ts`.
  String get capLabel => perTxnCapAlgo == null
      ? 'No per-step cap'
      : '$perTxnCapAlgo ALGO cap per step';

  /// The website's `tierCutLabel`.
  String get cutLabel => platformCutBps == 0
      ? 'No platform cut'
      : '${(platformCutBps / 100).toStringAsFixed(1)}% cut per transaction';

  static const all = <TierPolicy>[
    TierPolicy(
      tier: Tier.free,
      name: 'Free',
      priceLabel: r'$0',
      perTxnCapAlgo: 0.5,
      platformCutBps: 250,
      tagline: 'See exactly how it works, one approval at a time.',
      approvalSummary: 'Every payment',
      features: [
        'Every payment needs approval',
        'Full trace and history',
        'Cancel anytime',
      ],
    ),
    TierPolicy(
      tier: Tier.pro,
      name: 'Pro',
      priceLabel: r'$12/mo',
      perTxnCapAlgo: 5,
      platformCutBps: 100,
      tagline: 'Let it book the small things without asking.',
      approvalSummary: 'Above cap or new provider',
      featured: true,
      features: [
        'Approval only above cap',
        'New-provider approvals',
        'Priority workflow queue',
      ],
    ),
    TierPolicy(
      tier: Tier.promax,
      name: 'ProMax',
      priceLabel: r'$39/mo',
      perTxnCapAlgo: null,
      platformCutBps: 0,
      tagline: 'Full autonomy, with a policy backstop.',
      approvalSummary: 'Policy exceptions only',
      features: [
        'Approval only on policy exceptions',
        'Unlimited concurrent workflows',
        'Flat monthly fee',
      ],
    ),
  ];

  static TierPolicy of(Tier tier) => all.firstWhere((t) => t.tier == tier);
}
