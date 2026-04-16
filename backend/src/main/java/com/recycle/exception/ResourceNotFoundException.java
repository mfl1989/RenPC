package com.recycle.exception;

/**
 * 取得対象のリソースが存在しない場合の業務例外。
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}