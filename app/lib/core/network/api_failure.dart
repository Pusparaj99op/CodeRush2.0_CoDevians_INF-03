import 'package:flutter/foundation.dart';

import '../../data/models/workflow.dart';

/// Every way a backend call can fail, as a closed set.
///
/// Screens switch on [kind] to decide what to offer the user — retry, sign in
/// again, go back — so the difference between "the provider is briefly down"
/// and "this step was rejected" survives all the way to the UI instead of
/// collapsing into one generic error.
enum ApiFailureKind {
  /// 401. The token was missing, expired or rejected.
  unauthorized,

  /// 400. The request was malformed or the values were out of range.
  badRequest,

  /// 404. Also returned when a workflow belongs to someone else — the backend
  /// deliberately does not distinguish, to avoid leaking which ids exist.
  notFound,

  /// 409. The state moved on: already decided, already cancelled, wrong step
  /// status, or an approval is required first.
  conflict,

  /// 503 with `retryable: true`. A transient provider outage — offer a retry.
  providerUnavailable,

  /// 502. The provider rejected the work outright. Retrying will not help.
  providerRejected,

  /// No connection, or the request timed out.
  network,

  /// Anything else, including a 500.
  unexpected,
}

@immutable
class ApiFailure implements Exception {
  const ApiFailure({
    required this.kind,
    required this.message,
    this.statusCode,
    this.workflow,
    this.approval,
    this.rawBody,
  });

  final ApiFailureKind kind;

  /// Safe to show the user as-is. Never a stack trace or a raw exception.
  final String message;
  final int? statusCode;

  /// The 409/502/503 bodies carry the workflow, so a screen can render the
  /// updated state alongside the error rather than going blank.
  final Workflow? workflow;

  /// The execute route's 409 carries the approval that is blocking the step.
  final Approval? approval;

  final Object? rawBody;

  bool get isRetryable =>
      kind == ApiFailureKind.providerUnavailable ||
      kind == ApiFailureKind.network;

  /// Whether the user should be sent back to sign-in.
  bool get requiresReauth => kind == ApiFailureKind.unauthorized;

  /// Short heading for an error view.
  String get title => switch (kind) {
    ApiFailureKind.unauthorized => 'Please sign in again',
    ApiFailureKind.badRequest => 'That did not look right',
    ApiFailureKind.notFound => 'Not found',
    ApiFailureKind.conflict => 'Already handled',
    ApiFailureKind.providerUnavailable => 'A provider is unreachable',
    ApiFailureKind.providerRejected => 'That step could not be completed',
    ApiFailureKind.network => 'No connection',
    ApiFailureKind.unexpected => 'Something went wrong',
  };

  @override
  String toString() => 'ApiFailure(${kind.name}, $statusCode): $message';
}
