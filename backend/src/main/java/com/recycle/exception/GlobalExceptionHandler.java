package com.recycle.exception;

import com.recycle.common.ApiResponse;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        log.error("システムエラーが発生しました", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail(500, "システムエラーが発生しました。しばらくしてから再度お試しください。"));
    }
}
