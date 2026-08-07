import 'package:dio/dio.dart';

import '../../core/network/api_failure.dart';
import '../../core/network/dio_client.dart';
import '../models/enums.dart';
import '../models/tier.dart';
import '../models/workflow.dart';

/// Result of `GET /api/workflows/:id`.
class WorkflowDetail {
  const WorkflowDetail({required this.workflow, required this.recentEvents});

  final Workflow workflow;
  final List<LedgerEvent> recentEvents;
}

/// What was and was not bought when a trip is cancelled mid-run.
class CancelOutcome {
  const CancelOutcome({
    required this.workflow,
    required this.delivered,
    required this.notPurchased,
  });

  final Workflow workflow;

  /// Step ids already fulfilled — these were paid for and stay paid for.
  final List<String> delivered;

  /// Step ids that were never bought.
  final List<String> notPurchased;
}

/// Thin typed wrapper over the workflow routes.
///
/// Every method converts failures with [toApiFailure] and rethrows, so callers
/// only ever have to handle [ApiFailure].
class WorkflowApi {
  const WorkflowApi(this._dio);

  final Dio _dio;

  Future<List<Workflow>> list() async {
    try {
      final res = await _dio.get<dynamic>(ApiPaths.workflows);
      return Json.mapList(Json.map(res.data)['workflows'])
          .map(Workflow.fromJson)
          .toList(growable: false);
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  /// Submits a goal. The server compiles the plan and already advances it as
  /// far as it can, so the returned workflow may have completed steps.
  Future<Workflow> create({
    required String goal,
    required double budgetAlgo,
    required Tier tier,
  }) async {
    try {
      final res = await _dio.post<dynamic>(
        ApiPaths.workflows,
        data: {'goal': goal, 'budgetAlgo': budgetAlgo, 'tier': tier.wire},
      );
      return Workflow.fromJson(Json.map(Json.map(res.data)['workflow']));
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  Future<WorkflowDetail> get(String id) async {
    try {
      final res = await _dio.get<dynamic>(ApiPaths.workflow(id));
      final body = Json.map(res.data);
      return WorkflowDetail(
        workflow: Workflow.fromJson(Json.map(body['workflow'])),
        recentEvents: Json.mapList(body['recentEvents'])
            .map(LedgerEvent.fromJson)
            .toList(growable: false),
      );
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  /// The full replayable trace, oldest first.
  Future<List<LedgerEvent>> trace(String id) async {
    try {
      final res = await _dio.get<dynamic>(ApiPaths.trace(id));
      return Json.mapList(Json.map(res.data)['trace'])
          .map(LedgerEvent.fromJson)
          .toList(growable: false);
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  /// Approves or denies a blocked payment. The server advances the workflow
  /// afterwards either way — denying an optional step skips it and the rest of
  /// the trip carries on.
  Future<({Approval approval, Workflow workflow})> decide({
    required String workflowId,
    required String approvalId,
    required bool approve,
  }) async {
    try {
      final res = await _dio.post<dynamic>(
        ApiPaths.approve(workflowId),
        data: {
          'approvalId': approvalId,
          'decision': approve ? 'approved' : 'denied',
        },
      );
      final body = Json.map(res.data);
      return (
        approval: Approval.fromJson(Json.map(body['approval'])),
        workflow: Workflow.fromJson(Json.map(body['workflow'])),
      );
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  /// The emergency stop.
  Future<CancelOutcome> cancel(String id) async {
    try {
      final res = await _dio.post<dynamic>(ApiPaths.cancel(id));
      final body = Json.map(res.data);
      final closeOut = Json.map(body['closeOut']);
      return CancelOutcome(
        workflow: Workflow.fromJson(Json.map(body['workflow'])),
        delivered: Json.strList(closeOut['delivered']),
        notPurchased: Json.strList(closeOut['notPurchased']),
      );
    } catch (e) {
      throw toApiFailure(e);
    }
  }

  /// Retries a single step. Used after a transient provider outage — the
  /// budget and approval gates run again, so this cannot bypass them.
  Future<Workflow> retryStep({
    required String workflowId,
    required String stepId,
  }) async {
    try {
      final res = await _dio.post<dynamic>(
        ApiPaths.execute(workflowId, stepId),
      );
      return Workflow.fromJson(Json.map(Json.map(res.data)['workflow']));
    } catch (e) {
      throw toApiFailure(e);
    }
  }
}

/// `GET /api/providers` — the marketplace, with live health.
class ProvidersApi {
  const ProvidersApi(this._dio);

  final Dio _dio;

  Future<({List<ServiceProvider> providers, bool simulated})> list() async {
    try {
      final res = await _dio.get<dynamic>(ApiPaths.providers);
      final body = Json.map(res.data);
      return (
        providers: Json.mapList(body['providers'])
            .map(ServiceProvider.fromJson)
            .toList(growable: false),
        simulated: Json.str(body['settlementMode']) != 'real',
      );
    } catch (e) {
      throw toApiFailure(e);
    }
  }
}

/// Convenience for finding the approval that is blocking a given step.
extension ApprovalLookup on List<LedgerEvent> {
  /// Approval ids in the order they were requested, newest last.
  List<String> get requestedApprovalIds => where(
    (e) => e.type == LedgerEventType.approvalRequested,
  ).map((e) => Json.str(e.detail['approvalId'])).where((id) => id.isNotEmpty).toList();
}
