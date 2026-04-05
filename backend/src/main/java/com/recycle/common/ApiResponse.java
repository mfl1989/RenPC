package com.recycle.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * フロントエンドとの通信で使用する統一APIレスポンス（docs/01_dev_standards.md に準拠）。
 *
 * @param <T> data フィールドの型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    /**
     * 業務コード（成功時は 200）
     */
    private int code;

    /**
     * ユーザーに表示可能なメッセージ
     */
    private String message;

    /**
     * ペイロード。不要な場合は null
     */
    private T data;

    public static <T> ApiResponse<T> ok(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return ApiResponse.<T>builder().code(code).message(message).data(null).build();
    }
}
