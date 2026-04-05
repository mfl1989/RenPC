package com.recycle.service;

import com.recycle.common.ApiResponse;
import org.springframework.stereotype.Service;

/**
 * 疎通確認用の挨拶メッセージを組み立てる。
 */
@Service
public class HelloService {

    private static final String HELLO_MESSAGE = "バックエンドとの通信に成功しました！";

    public ApiResponse<Void> buildHelloResponse() {
        return ApiResponse.ok(HELLO_MESSAGE, null);
    }
}
