import 'package:json_annotation/json_annotation.dart';

/// Mirrors `StepStatus` in `website/lib/types.ts`. All ten values, wire-exact.
///
/// [unknown] is not a backend value — it is the landing spot for anything the
/// server adds later. Decoding must never throw: a new status appearing in
/// production would otherwise blank out the user's whole trip list rather than
/// showing one unfamiliar row.
@JsonEnum(valueField: 'wire')
enum StepStatus {
  pending('pending'),
  quoted('quoted'),
  awaitingApproval('awaiting_approval'),
  paying('paying'),
  paid('paid'),
  verifying('verifying'),
  fulfilled('fulfilled'),
  skipped('skipped'),
  failed('failed'),
  cancelled('cancelled'),

  @JsonValue('__unknown__')
  unknown('__unknown__');

  const StepStatus(this.wire);

  final String wire;

  static StepStatus fromWire(Object? value) => values.firstWhere(
    (s) => s.wire == value,
    orElse: () => StepStatus.unknown,
  );

  /// Nothing further will happen to this step without user action.
  bool get isTerminal => const {
    StepStatus.fulfilled,
    StepStatus.skipped,
    StepStatus.failed,
    StepStatus.cancelled,
  }.contains(this);

  /// The agent is working on it right now.
  bool get isActive => const {
    StepStatus.quoted,
    StepStatus.paying,
    StepStatus.paid,
    StepStatus.verifying,
  }.contains(this);

  /// Plain-language label. The user should never see a raw enum name.
  String get label => switch (this) {
    StepStatus.pending => 'Queued',
    StepStatus.quoted => 'Quoted',
    StepStatus.awaitingApproval => 'Needs you',
    StepStatus.paying => 'Paying',
    StepStatus.paid => 'Paid',
    StepStatus.verifying => 'Checking',
    StepStatus.fulfilled => 'Booked',
    StepStatus.skipped => 'Skipped',
    StepStatus.failed => 'Failed',
    StepStatus.cancelled => 'Cancelled',
    StepStatus.unknown => 'Unknown',
  };
}

/// Mirrors `WorkflowStatus` in `website/lib/types.ts`.
@JsonEnum(valueField: 'wire')
enum WorkflowStatus {
  planning('planning'),
  running('running'),
  cancelled('cancelled'),
  completed('completed'),
  failed('failed'),

  @JsonValue('__unknown__')
  unknown('__unknown__');

  const WorkflowStatus(this.wire);

  final String wire;

  static WorkflowStatus fromWire(Object? value) => values.firstWhere(
    (s) => s.wire == value,
    orElse: () => WorkflowStatus.unknown,
  );

  /// Whether the agent may still act. Drives whether the trace keeps polling.
  bool get isLive =>
      this == WorkflowStatus.planning || this == WorkflowStatus.running;

  String get label => switch (this) {
    WorkflowStatus.planning => 'Planning',
    WorkflowStatus.running => 'In progress',
    WorkflowStatus.cancelled => 'Cancelled',
    WorkflowStatus.completed => 'Booked',
    WorkflowStatus.failed => 'Failed',
    WorkflowStatus.unknown => 'Unknown',
  };
}

/// Mirrors `PaymentScheme` — `exact` pays the quote, `upto` pays at most it.
@JsonEnum(valueField: 'wire')
enum PaymentScheme {
  exact('exact'),
  upto('upto');

  const PaymentScheme(this.wire);

  final String wire;

  static PaymentScheme fromWire(Object? value) => values.firstWhere(
    (s) => s.wire == value,
    // `exact` is the conservative reading: it promises no headroom the server
    // might not honour.
    orElse: () => PaymentScheme.exact,
  );
}

/// Mirrors `Approval["status"]`.
@JsonEnum(valueField: 'wire')
enum ApprovalStatus {
  pending('pending'),
  approved('approved'),
  denied('denied');

  const ApprovalStatus(this.wire);

  final String wire;

  static ApprovalStatus fromWire(Object? value) => values.firstWhere(
    (s) => s.wire == value,
    orElse: () => ApprovalStatus.pending,
  );
}

/// Mirrors `LedgerEventType` — all thirteen, and no more.
///
/// The backend deliberately carries new information in an existing event's
/// `detail` rather than adding types, so this list stays closed. [unknown]
/// exists only so an unrecognised event renders as one skipped row instead of
/// throwing away the entire trace.
@JsonEnum(valueField: 'wire')
enum LedgerEventType {
  workflowCreated('workflow_created'),
  offerSeen('offer_seen'),
  quoteReceived('quote_received'),
  approvalRequested('approval_requested'),
  approvalDecided('approval_decided'),
  paymentVerified('payment_verified'),
  paymentSettled('payment_settled'),
  providerCalled('provider_called'),
  providerResult('provider_result'),
  fulfillmentVerified('fulfillment_verified'),
  stepFailed('step_failed'),
  workflowCancelled('workflow_cancelled'),
  workflowCompleted('workflow_completed'),

  @JsonValue('__unknown__')
  unknown('__unknown__');

  const LedgerEventType(this.wire);

  final String wire;

  static LedgerEventType fromWire(Object? value) => values.firstWhere(
    (e) => e.wire == value,
    orElse: () => LedgerEventType.unknown,
  );
}
