package com.recycle.controller;

import com.recycle.common.ApiResponse;
import com.recycle.service.HelloService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * フロントエンドとの疎通確認用コントローラ。
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TestController {

    private final HelloService helloService;

    /**
     * GET /api/hello — 統一 JSON 形式で成功メッセージを返す。
     */
    @GetMapping("/hello")
    public ApiResponse<Void> hello() {
        return helloService.buildHelloResponse();
    }
}
