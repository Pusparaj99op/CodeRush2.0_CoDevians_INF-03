import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../data/models/workflow.dart';
import '../config/env.dart';
import 'api_failure.dart';

/// Every backend path, in one place, so no caller builds a URL by hand.
abstract final class ApiPaths {
  static const workflows = '/api/workflows';
  static String workflow(String id) => '/api/workflows/$id';
  static String trace(String id) => '/api/workflows/$id/trace';
  static String approve(String id) => '/api/workflows/$id/approve';
  static String cancel(String id) => '/api/workflows/$id/cancel';
  static String execute(String id, String stepId) =>
      '/api/workflows/$id/steps/$stepId/execute';
  static const providers = '/api/providers';
  static const facilitatorTerms = '/api/facilitator/terms';
}

/// Supplies a Firebase ID token, and can force a refresh once after a 401.
typedef TokenProvider = Future<String?> Function({bool forceRefresh});

/// Called when a 401 survives a forced token refresh — the session is over.
typedef SessionExpiredCallback = void Function();

/// Builds the configured Dio instance.
///
/// The interceptors do two jobs and nothing else: attach the bearer token, and
/// convert every failure into an [ApiFailure]. Mapping in exactly one place is
/// what lets repositories rethrow blindly and screens switch exhaustively.
Dio buildDioClient({
  required TokenProvider tokenProvider,
  SessionExpiredCallback? onSessionExpired,
  String? baseUrl,
  Dio? inner,
}) {
  final dio = inner ?? Dio();
  dio.options = dio.options.copyWith(
    baseUrl: baseUrl ?? Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 20),
    // Generous: an agent step can involve the orchestrator paying a provider
    // and waiting on real inference before it answers.
    receiveTimeout: const Duration(seconds: 60),
    sendTimeout: const Duration(seconds: 20),
    contentType: Headers.jsonContentType,
    responseType: ResponseType.json,
    // Never let Dio throw for a status on its own — the error interceptor owns
    // all of that, so there is one path and one mapping.
    validateStatus: (_) => true,
  );

  dio.interceptors.add(
    _AuthInterceptor(
      tokenProvider: tokenProvider,
      onSessionExpired: onSessionExpired,
      dio: dio,
    ),
  );
  dio.interceptors.add(_ErrorInterceptor());

  if (kDebugMode) {
    dio.interceptors.add(
      LogInterceptor(requestBody: true, responseBody: false),
    );
  }

  return dio;
}

class _AuthInterceptor extends Interceptor {
  _AuthInterceptor({
    required this.tokenProvider,
    required this.dio,
    this.onSessionExpired,
  });

  final TokenProvider tokenProvider;
  final SessionExpiredCallback? onSessionExpired;
  final Dio dio;

  /// Marks a request that has already been retried, so a persistently
  /// rejected token cannot loop.
  static const _retriedKey = 'veldar_retried_after_401';

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await tokenProvider(forceRefresh: false);
    if (token != null) {
      options.headers['authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) async {
    if (response.statusCode != 401 ||
        response.requestOptions.extra[_retriedKey] == true) {
      return handler.next(response);
    }

    // Firebase refreshes tokens shortly before expiry, but a device that slept
    // through the window comes back with a stale one. One forced refresh and
    // retry turns that into a non-event instead of an unexplained sign-out.
    final fresh = await tokenProvider(forceRefresh: true);
    if (fresh == null) {
      onSessionExpired?.call();
      return handler.next(response);
    }

    final options = response.requestOptions
      ..headers['authorization'] = 'Bearer $fresh'
      ..extra[_retriedKey] = true;

    try {
      final retried = await dio.fetch<dynamic>(options);
      if (retried.statusCode == 401) onSessionExpired?.call();
      return handler.next(retried);
    } catch (_) {
      return handler.next(response);
    }
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    final status = response.statusCode ?? 0;
    if (status >= 200 && status < 300) {
      return handler.next(response);
    }
    handler.reject(
      DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: mapResponseToFailure(response),
      ),
      true,
    );
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.error is ApiFailure) return handler.next(err);
    handler.next(
      DioException(
        requestOptions: err.requestOptions,
        response: err.response,
        type: err.type,
        error: mapDioExceptionToFailure(err),
      ),
    );
  }
}

/// Maps a non-2xx response to a typed failure. Exported for direct testing.
ApiFailure mapResponseToFailure(Response<dynamic> response) {
  final status = response.statusCode ?? 0;
  final body = response.data is Map
      ? Map<String, dynamic>.from(response.data as Map)
      : const <String, dynamic>{};

  final serverMessage = body['error'] is String
      ? body['error'] as String
      : null;
  final reason = body['reason'] is String ? body['reason'] as String : null;

  Workflow? workflow;
  if (body['workflow'] is Map) {
    workflow = Workflow.fromJson(Map<String, dynamic>.from(body['workflow'] as Map));
  }
  Approval? approval;
  if (body['approval'] is Map) {
    approval = Approval.fromJson(Map<String, dynamic>.from(body['approval'] as Map));
  }

  ApiFailure make(ApiFailureKind kind, String fallback) => ApiFailure(
    kind: kind,
    // Prefer the server's own wording: it knows which of several 400s or 409s
    // this was, and rephrasing would only make it vaguer.
    message: serverMessage ?? fallback,
    statusCode: status,
    workflow: workflow,
    approval: approval,
    rawBody: response.data,
  );

  return switch (status) {
    401 => ApiFailure(
      kind: ApiFailureKind.unauthorized,
      message: reason ?? 'Your session has expired. Please sign in again.',
      statusCode: status,
      rawBody: response.data,
    ),
    400 => make(ApiFailureKind.badRequest, 'That request was not valid.'),
    404 => make(ApiFailureKind.notFound, 'We could not find that.'),
    409 => make(ApiFailureKind.conflict, 'This has already been handled.'),
    502 => make(
      ApiFailureKind.providerRejected,
      'The provider could not complete this step.',
    ),
    503 => make(
      ApiFailureKind.providerUnavailable,
      'A provider is temporarily unreachable. Try again shortly.',
    ),
    _ => make(ApiFailureKind.unexpected, 'Something went wrong ($status).'),
  };
}

/// Maps a transport-level Dio error. Exported for direct testing.
ApiFailure mapDioExceptionToFailure(DioException err) {
  final response = err.response;
  if (response != null && (response.statusCode ?? 0) >= 400) {
    return mapResponseToFailure(response);
  }

  return switch (err.type) {
    DioExceptionType.connectionTimeout ||
    DioExceptionType.sendTimeout ||
    DioExceptionType.receiveTimeout => const ApiFailure(
      kind: ApiFailureKind.network,
      message: 'That took too long. Check your connection and try again.',
    ),
    DioExceptionType.connectionError => const ApiFailure(
      kind: ApiFailureKind.network,
      message: 'Could not reach Veldar. Check your connection.',
    ),
    DioExceptionType.cancel => const ApiFailure(
      kind: ApiFailureKind.network,
      message: 'The request was cancelled.',
    ),
    _ => ApiFailure(
      kind: ApiFailureKind.unexpected,
      message: err.message ?? 'Something went wrong.',
    ),
  };
}

/// Unwraps whatever a Dio call threw into an [ApiFailure].
///
/// Repositories call this in one `catch` rather than inspecting Dio types
/// themselves, so no untyped exception escapes into the UI layer.
ApiFailure toApiFailure(Object error) {
  if (error is ApiFailure) return error;
  if (error is DioException) {
    final inner = error.error;
    if (inner is ApiFailure) return inner;
    return mapDioExceptionToFailure(error);
  }
  return ApiFailure(
    kind: ApiFailureKind.unexpected,
    message: error.toString(),
  );
}
