import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/api_failure.dart';
import '../core/network/dio_client.dart';
import '../data/models/enums.dart';
import '../data/models/tier.dart';
import '../data/models/workflow.dart';
import '../data/remote/workflow_api.dart';
import 'auth_providers.dart';
import 'subscription_providers.dart';

final dioProvider = Provider<Dio>((ref) {
  final auth = ref.watch(authRepositoryProvider);
  final dio = buildDioClient(
    tokenProvider: ({bool forceRefresh = false}) =>
        auth.idToken(forceRefresh: forceRefresh),
    // A token that will not refresh means the session is genuinely over.
    // Signing out puts the router's redirect in charge rather than leaving
    // the user staring at repeated 401 banners.
    onSessionExpired: () => unawaited(auth.signOut()),
  );
  ref.onDispose(dio.close);
  return dio;
});

final workflowApiProvider = Provider<WorkflowApi>(
  (ref) => WorkflowApi(ref.watch(dioProvider)),
);

final providersApiProvider = Provider<ProvidersApi>(
  (ref) => ProvidersApi(ref.watch(dioProvider)),
);

/// All of the signed-in user's trips, newest first.
final tripListProvider = FutureProvider<List<Workflow>>((ref) async {
  // Rebinding to auth means signing out clears the list rather than leaving
  // the previous user's trips on screen.
  final user = ref.watch(currentUserProvider);
  if (user == null) return const [];
  return ref.watch(workflowApiProvider).list();
});

/// Trips the agent is still working on.
final activeTripsProvider = Provider<List<Workflow>>((ref) {
  return ref.watch(tripListProvider).valueOrNull?.where((w) => w.status.isLive).toList() ??
      const [];
});

/// How many decisions are waiting on the user, for the Activity tab badge.
final pendingApprovalCountProvider = Provider<int>((ref) {
  return ref
      .watch(activeTripsProvider)
      .fold(0, (sum, w) => sum + w.blockedSteps.length);
});

/// One trip plus its full trace, kept fresh while the agent is working.
///
/// Polls rather than streaming: Firestore security rules do not exist in the
/// repo yet, so a direct client read would be denied. The poll stops the moment
/// the workflow reaches a terminal state, so an idle app makes no requests.
class TripDetail {
  const TripDetail({required this.workflow, required this.trace});

  final Workflow workflow;
  final List<LedgerEvent> trace;

  /// The approval blocking [stepId], if the trace recorded one.
  String? approvalIdForStep(String stepId) {
    for (final event in trace.reversed) {
      if (event.type != LedgerEventType.approvalRequested) continue;
      if (event.stepId != stepId) continue;
      final id = Json.str(event.detail['approvalId']);
      if (id.isNotEmpty) return id;
    }
    return null;
  }

  /// The single approval the user should be shown first.
  ({String approvalId, WorkflowStep step})? get nextApproval {
    for (final step in workflow.steps) {
      if (step.status != StepStatus.awaitingApproval) continue;
      final id = approvalIdForStep(step.id);
      if (id != null) return (approvalId: id, step: step);
    }
    return null;
  }
}

class TripDetailController extends FamilyAsyncNotifier<TripDetail, String> {
  Timer? _timer;

  @override
  Future<TripDetail> build(String workflowId) async {
    ref.onDispose(() => _timer?.cancel());
    final detail = await _fetch(workflowId);
    _schedule(detail.workflow.status);
    return detail;
  }

  Future<TripDetail> _fetch(String id) async {
    final api = ref.read(workflowApiProvider);
    // Two calls rather than one: GET :id only carries the last ten events, and
    // the trace screen has to show the whole thing.
    final results = await Future.wait([api.get(id), api.trace(id)]);
    return TripDetail(
      workflow: (results[0] as WorkflowDetail).workflow,
      trace: results[1] as List<LedgerEvent>,
    );
  }

  void _schedule(WorkflowStatus status) {
    _timer?.cancel();
    if (!status.isLive) return;
    _timer = Timer(const Duration(seconds: 3), refresh);
  }

  /// Re-reads without flashing a spinner over content already on screen.
  Future<void> refresh() async {
    try {
      final detail = await _fetch(arg);
      state = AsyncValue.data(detail);
      _schedule(detail.workflow.status);
    } on ApiFailure catch (e, s) {
      // A dropped connection mid-poll should not wipe the trip the user is
      // reading; keep the last good data and try again shortly.
      if (e.isRetryable && state.hasValue) {
        _schedule(WorkflowStatus.running);
        return;
      }
      state = AsyncValue.error(e, s);
    }
  }

  Future<void> decide({
    required String approvalId,
    required bool approve,
  }) async {
    await ref.read(workflowApiProvider).decide(
      workflowId: arg,
      approvalId: approvalId,
      approve: approve,
    );
    await refresh();
    ref.invalidate(tripListProvider);
  }

  Future<CancelOutcome> cancel() async {
    final outcome = await ref.read(workflowApiProvider).cancel(arg);
    await refresh();
    ref.invalidate(tripListProvider);
    return outcome;
  }

  Future<void> retryStep(String stepId) async {
    try {
      await ref.read(workflowApiProvider).retryStep(
        workflowId: arg,
        stepId: stepId,
      );
    } finally {
      // Even a failed retry moves the ledger on, so refresh regardless.
      await refresh();
    }
  }
}

final tripDetailProvider =
    AsyncNotifierProvider.family<TripDetailController, TripDetail, String>(
      TripDetailController.new,
    );

/// Submits a goal and hands back the created workflow id.
class CreateTripController extends AsyncNotifier<Workflow?> {
  @override
  Future<Workflow?> build() async => null;

  Future<Workflow?> submit({
    required String goal,
    required double budgetAlgo,
  }) async {
    state = const AsyncValue.loading();
    final result = await AsyncValue.guard(
      () => ref
          .read(workflowApiProvider)
          .create(
            goal: goal,
            budgetAlgo: budgetAlgo,
            tier: ref.read(tierProvider),
          ),
    );
    state = result;
    if (result.hasValue) ref.invalidate(tripListProvider);
    return result.valueOrNull;
  }

  void reset() => state = const AsyncValue.data(null);
}

final createTripProvider =
    AsyncNotifierProvider<CreateTripController, Workflow?>(
      CreateTripController.new,
    );

final marketplaceProvider =
    FutureProvider<({List<ServiceProvider> providers, bool simulated})>((ref) {
      return ref.watch(providersApiProvider).list();
    });
