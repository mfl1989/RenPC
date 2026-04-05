package com.recycle.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.recycle.service.ZipSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;

/**
 * 郵便番号検索の BFF：フロントは常に同一オリジンの /api/zip/search を呼ぶ
 */
@RestController
@RequestMapping("/api/zip")
@RequiredArgsConstructor
public class ZipSearchController {

    private final ZipSearchService zipSearchService;
    private final ObjectMapper objectMapper;

    /**
     * GET /api/zip/search?zipcode=1000001
     * レスポンス本文は ZipCloud と同形の JSON オブジェクト（String 直返しによる二重 JSON 化は行わない）
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<JsonNode> search(@RequestParam(name = "zipcode", required = false) String zipcode) {
        if (zipcode == null || !zipcode.matches("\\d{7}")) {
            return ResponseEntity.badRequest().body(errorJson(400, "郵便番号は7桁の半角数字で指定してください"));
        }
        try {
            JsonNode body = zipSearchService.fetchZipCloudJson(zipcode);
            return ResponseEntity.ok(body);
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorJson(500, "郵便番号検索サービスに接続できませんでした"));
        }
    }

    private ObjectNode errorJson(int status, String message) {
        ObjectNode n = objectMapper.createObjectNode();
        n.put("status", status);
        n.put("message", message);
        n.set("results", objectMapper.nullNode());
        return n;
    }
}
