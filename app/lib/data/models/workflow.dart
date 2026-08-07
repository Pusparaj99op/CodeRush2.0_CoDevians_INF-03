import 'dart:convert';

import 'package:flutter/foundation.dart';

import 'enums.dart';
import 'tier.dart';

/// Helpers shared by every model.
///
/// The backend is the source of truth for these shapes, so decoding is
/// defensive throughout: a field arriving as the wrong type, or missing
/// entirely, must degrade to a sane default rather than throw. A parse failure
/// mid-trip would otherwise hide a booking the user has already paid for.
abstract final class Json {
  static String str(Object? v, [String fallback = '']) =>
      v is String ? v : fallback;

  static String? strOrNull(Object? v) => v is String && v.isNotEmpty ? v : null;

  static double num_(Object? v, [double fallback = 0]) =>
      v is num ? v.toDouble() : fallback;

  static double? numOrNull(Object? v) => v is num ? v.toDouble() : null;

  static bool bool_(Object? v, [bool fallback = false]) =>
      v is bool ? v : fallback;

  static List<String> strList(Object? v) =>
      v is List ? v.whereType<String>().toList(growable: false) : const [];

  static Map<String, dynamic> map(Object? v) =>
      v is Map ? Map<String, dynamic>.from(v) : const {};

  static List<Map<String, dynamic>> mapList(Object? v) => v is List
      ? v.whereType<Map>().map(Map<String, dynamic>.from).toList(growable: false)
      : const [];

  /// Backend timestamps are ISO-8601 strings. Unparseable ones become null so
  /// the UI shows no date rather than the epoch.
  static DateTime? date(Object? v) =>
      v is String ? DateTime.tryParse(v)?.toLocal() : null;
}

/// One step of the agent's plan. Mirrors `WorkflowStep`.
@immutable
class WorkflowStep {
  const WorkflowStep({
    required this.id,
    required this.providerId,
    required this.description,
    required this.dependsOn,
    required this.status,
    this.condition,
    this.quotedPriceAlgo,
    this.settledPriceAlgo,
    this.receiptId,
    this.output,
    this.optional = false,
  });

  factory WorkflowStep.fromJson(Map<String, dynamic> json) => WorkflowStep(
    id: Json.str(json['id']),
    providerId: Json.str(json['providerId']),
    description: Json.str(json['description']),
    condition: Json.strOrNull(json['condition']),
    dependsOn: Json.strList(json['dependsOn']),
    status: StepStatus.fromWire(json['status']),
    quotedPriceAlgo: Json.numOrNull(json['quotedPriceAlgo']),
    settledPriceAlgo: Json.numOrNull(json['settledPriceAlgo']),
    receiptId: Json.strOrNull(json['receiptId']),
    output: Json.strOrNull(json['output']),
    // Absent on documents written before travel compilation existed, which
    // therefore read as core — matching the backend's own default.
    optional: Json.bool_(json['optional']),
  );

  final String id;
  final String providerId;
  final String description;

  /// Human-readable reason this step might not run at all.
  final String? condition;
  final List<String> dependsOn;
  final StepStatus status;
  final double? quotedPriceAlgo;
  final double? settledPriceAlgo;
  final String? receiptId;

  /// What the provider returned. Leads with a `VELDAR-META` line the app
  /// strips before display — see [humanOutput].
  final String? output;
  final bool optional;

  /// What this step actually cost, or will cost. Settled wins over quoted:
  /// on the `upto` scheme the final fare comes in below the ceiling, and
  /// showing the ceiling after the fact would overstate the spend.
  double? get effectivePriceAlgo => settledPriceAlgo ?? quotedPriceAlgo;

  /// The provider's result with the machine-readable header removed.
  String? get humanOutput {
    final raw = output;
    if (raw == null) return null;
    final lines = raw.split('\n');
    if (lines.isNotEmpty && lines.first.startsWith(kMetaPrefix)) {
      final rest = lines.skip(1).join('\n').trim();
      return rest.isEmpty ? null : rest;
    }
    return raw.trim().isEmpty ? null : raw.trim();
  }

  /// The parsed `VELDAR-META` header, or null when there isn't one.
  Map<String, dynamic>? get meta => parseStepMeta(output);

  Map<String, dynamic> toJson() => {
    'id': id,
    'providerId': providerId,
    'description': description,
    if (condition != null) 'condition': condition,
    'dependsOn': dependsOn,
    'status': status.wire,
    'quotedPriceAlgo': quotedPriceAlgo,
    'settledPriceAlgo': settledPriceAlgo,
    'receiptId': receiptId,
    if (output != null) 'output': output,
    'optional': optional,
  };

  @override
  bool operator ==(Object other) =>
      other is WorkflowStep &&
      other.id == id &&
      other.status == status &&
      other.quotedPriceAlgo == quotedPriceAlgo &&
      other.settledPriceAlgo == settledPriceAlgo &&
      other.receiptId == receiptId &&
      other.output == output &&
      other.optional == optional;

  @override
  int get hashCode => Object.hash(id, status, settledPriceAlgo, output);
}

/// The prefix the backend puts on its machine-readable result header.
const kMetaPrefix = 'VELDAR-META ';

/// Extracts the meta header from a provider's output.
///
/// Malformed JSON returns null rather than throwing — the header is an
/// optimisation for richer display, never a correctness dependency.
Map<String, dynamic>? parseStepMeta(String? output) {
  if (output == null || output.isEmpty) return null;
  final firstLine = output.split('\n').first;
  if (!firstLine.startsWith(kMetaPrefix)) return null;
  try {
    final decoded = jsonDecodeSafe(firstLine.substring(kMetaPrefix.length));
    return decoded is Map ? Map<String, dynamic>.from(decoded) : null;
  } catch (_) {
    return null;
  }
}

/// A whole trip. Mirrors `Workflow`.
@immutable
class Workflow {
  const Workflow({
    required this.id,
    required this.userId,
    required this.tier,
    required this.goal,
    required this.budgetAlgo,
    required this.spentAlgo,
    required this.status,
    required this.steps,
    this.createdAt,
    this.updatedAt,
  });

  factory Workflow.fromJson(Map<String, dynamic> json) => Workflow(
    id: Json.str(json['id']),
    userId: Json.str(json['userId']),
    tier: Tier.fromWire(json['tier'] as String?),
    goal: Json.str(json['goal']),
    budgetAlgo: Json.num_(json['budgetAlgo']),
    spentAlgo: Json.num_(json['spentAlgo']),
    status: WorkflowStatus.fromWire(json['status']),
    steps: Json.mapList(json['steps'])
        .map(WorkflowStep.fromJson)
        .toList(growable: false),
    createdAt: Json.date(json['createdAt']),
    updatedAt: Json.date(json['updatedAt']),
  );

  final String id;
  final String userId;
  final Tier tier;

  /// The user's own words. Shown verbatim — it is what they asked for.
  final String goal;
  final double budgetAlgo;
  final double spentAlgo;
  final WorkflowStatus status;
  final List<WorkflowStep> steps;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  double get remainingAlgo => (budgetAlgo - spentAlgo).clamp(0, budgetAlgo);

  /// Steps the user has to decide on before the agent can continue.
  List<WorkflowStep> get blockedSteps =>
      steps.where((s) => s.status == StepStatus.awaitingApproval).toList();

  bool get needsAttention => blockedSteps.isNotEmpty;

  /// Fraction of the plan resolved, for a progress meter. Counts skipped
  /// steps as done — they are resolved, just not purchased.
  double get progress {
    if (steps.isEmpty) return 0;
    final done = steps.where((s) => s.status.isTerminal).length;
    return done / steps.length;
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': userId,
    'tier': tier.wire,
    'goal': goal,
    'budgetAlgo': budgetAlgo,
    'spentAlgo': spentAlgo,
    'status': status.wire,
    'steps': steps.map((s) => s.toJson()).toList(),
    if (createdAt != null) 'createdAt': createdAt!.toUtc().toIso8601String(),
    if (updatedAt != null) 'updatedAt': updatedAt!.toUtc().toIso8601String(),
  };

  @override
  bool operator ==(Object other) =>
      other is Workflow &&
      other.id == id &&
      other.status == status &&
      other.spentAlgo == spentAlgo &&
      listEquals(other.steps, steps);

  @override
  int get hashCode => Object.hash(id, status, spentAlgo, Object.hashAll(steps));
}

/// A payment the agent is waiting on. Mirrors `Approval`.
@immutable
class Approval {
  const Approval({
    required this.id,
    required this.workflowId,
    required this.stepId,
    required this.providerId,
    required this.amountAlgo,
    required this.reason,
    required this.status,
    this.createdAt,
    this.decidedAt,
  });

  factory Approval.fromJson(Map<String, dynamic> json) => Approval(
    id: Json.str(json['id']),
    workflowId: Json.str(json['workflowId']),
    stepId: Json.str(json['stepId']),
    providerId: Json.str(json['providerId']),
    amountAlgo: Json.num_(json['amountAlgo']),
    reason: Json.str(json['reason']),
    status: ApprovalStatus.fromWire(json['status']),
    createdAt: Json.date(json['createdAt']),
    decidedAt: Json.date(json['decidedAt']),
  );

  final String id;
  final String workflowId;
  final String stepId;
  final String providerId;
  final double amountAlgo;

  /// Why the agent had to ask — over the tier cap, or an unverified provider.
  final String reason;
  final ApprovalStatus status;
  final DateTime? createdAt;
  final DateTime? decidedAt;

  bool get isPending => status == ApprovalStatus.pending;

  Map<String, dynamic> toJson() => {
    'id': id,
    'workflowId': workflowId,
    'stepId': stepId,
    'providerId': providerId,
    'amountAlgo': amountAlgo,
    'reason': reason,
    'status': status.wire,
    if (createdAt != null) 'createdAt': createdAt!.toUtc().toIso8601String(),
    'decidedAt': decidedAt?.toUtc().toIso8601String(),
  };

  @override
  bool operator ==(Object other) =>
      other is Approval && other.id == id && other.status == status;

  @override
  int get hashCode => Object.hash(id, status);
}

/// A settled payment. Mirrors `Receipt`.
@immutable
class Receipt {
  const Receipt({
    required this.id,
    required this.workflowId,
    required this.stepId,
    required this.providerId,
    required this.amountAlgo,
    required this.scheme,
    required this.txnHash,
    required this.simulated,
    this.network = 'testnet',
    this.settledAt,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) => Receipt(
    id: Json.str(json['id']),
    workflowId: Json.str(json['workflowId']),
    stepId: Json.str(json['stepId']),
    providerId: Json.str(json['providerId']),
    amountAlgo: Json.num_(json['amountAlgo']),
    scheme: PaymentScheme.fromWire(json['scheme']),
    txnHash: Json.str(json['txnHash']),
    network: Json.str(json['network'], 'testnet'),
    // Defaults true: claiming a payment was real when we cannot tell would be
    // the more misleading error.
    simulated: Json.bool_(json['simulated'], true),
    settledAt: Json.date(json['settledAt']),
  );

  final String id;
  final String workflowId;
  final String stepId;
  final String providerId;
  final double amountAlgo;
  final PaymentScheme scheme;
  final String txnHash;
  final String network;

  /// True when no real chain transaction backs this. Must always be surfaced.
  final bool simulated;
  final DateTime? settledAt;

  Map<String, dynamic> toJson() => {
    'id': id,
    'workflowId': workflowId,
    'stepId': stepId,
    'providerId': providerId,
    'amountAlgo': amountAlgo,
    'scheme': scheme.wire,
    'txnHash': txnHash,
    'network': network,
    'simulated': simulated,
    if (settledAt != null) 'settledAt': settledAt!.toUtc().toIso8601String(),
  };

  @override
  bool operator ==(Object other) => other is Receipt && other.id == id;

  @override
  int get hashCode => id.hashCode;
}

/// One entry in the replayable audit trail. Mirrors `LedgerEvent`.
@immutable
class LedgerEvent {
  const LedgerEvent({
    required this.id,
    required this.workflowId,
    required this.type,
    required this.detail,
    this.stepId,
    this.at,
  });

  factory LedgerEvent.fromJson(Map<String, dynamic> json) => LedgerEvent(
    id: Json.str(json['id']),
    workflowId: Json.str(json['workflowId']),
    type: LedgerEventType.fromWire(json['type']),
    stepId: Json.strOrNull(json['stepId']),
    detail: Json.map(json['detail']),
    at: Json.date(json['at']),
  );

  final String id;
  final String workflowId;
  final LedgerEventType type;
  final String? stepId;

  /// Free-form payload; shape varies by [type]. Read defensively.
  final Map<String, dynamic> detail;
  final DateTime? at;

  /// True when this event records a step being skipped rather than run. The
  /// backend reuses `provider_result` for this instead of adding an event type.
  bool get isSkip =>
      type == LedgerEventType.providerResult && detail['skipped'] == true;

  Map<String, dynamic> toJson() => {
    'id': id,
    'workflowId': workflowId,
    'type': type.wire,
    if (stepId != null) 'stepId': stepId,
    'detail': detail,
    if (at != null) 'at': at!.toUtc().toIso8601String(),
  };

  @override
  bool operator ==(Object other) => other is LedgerEvent && other.id == id;

  @override
  int get hashCode => id.hashCode;
}

/// A marketplace participant. Mirrors `Provider & { status }`.
@immutable
class ServiceProvider {
  const ServiceProvider({
    required this.id,
    required this.name,
    required this.capability,
    required this.scheme,
    required this.priceAlgo,
    required this.verified,
    this.mock = false,
    this.online,
    this.statusReason,
  });

  factory ServiceProvider.fromJson(Map<String, dynamic> json) {
    final status = Json.map(json['status']);
    return ServiceProvider(
      id: Json.str(json['id']),
      name: Json.str(json['name']),
      capability: Json.str(json['capability']),
      scheme: PaymentScheme.fromWire(json['scheme']),
      priceAlgo: Json.num_(json['priceAlgo']),
      verified: Json.bool_(json['verified']),
      mock: Json.bool_(json['mock']),
      online: status['online'] is bool ? status['online'] as bool : null,
      statusReason: Json.strOrNull(status['reason']),
    );
  }

  final String id;
  final String name;
  final String capability;
  final PaymentScheme scheme;
  final double priceAlgo;

  /// Unverified providers always require approval, whatever the tier.
  final bool verified;
  final bool mock;
  final bool? online;
  final String? statusReason;

  @override
  bool operator ==(Object other) =>
      other is ServiceProvider && other.id == id && other.online == online;

  @override
  int get hashCode => Object.hash(id, online);
}

/// `jsonDecode` that returns null instead of throwing on malformed input.
Object? jsonDecodeSafe(String source) {
  try {
    return jsonDecode(source);
  } catch (_) {
    return null;
  }
}
