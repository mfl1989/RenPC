package com.recycle.exception;

import com.recycle.common.ApiResponse;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * API 共通例外処理。スタックトレースはレスポンスに含めない（docs/01_dev_standards.md）。
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message =
                ex.getBindingResult().getAllErrors().stream()
                        .map(err -> err.getDefaultMessage())
                        .filter(Objects::nonNull)
                        .filter(s -> !s.isBlank())
                        .distinct()
                        .collect(Collectors.joining("；"));

        if (message.isEmpty()) {
            message = "入力内容をご確認ください";
        }

        log.warn("入力検証エラー: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(400, message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("リクエストエラー: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.fail(400, ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("リソース未検出: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.fail(404, ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("システムエラーが発生しました", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail(500, "システムエラーが発生しました。しばらくしてから再度お試しください。"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        // 認証エラーは業務エラー扱い。スタックトレースは返さない。
        log.warn("認証エラー: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail(401, "認証に失敗しました"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("権限エラー: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail(403, "権限がありません"));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLock(
            ObjectOptimisticLockingFailureException ex) {
        log.warn("楽観ロック競合が発生しました: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(
                        ApiResponse.fail(
                                409,
                                "他のユーザーによってデータが更新されました。最新のデータを取得して再度実行してください。"));
    }
}
