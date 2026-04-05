package com.recycle.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

/**
 * ZipCloud API へサーバー側から問い合わせる（ブラウザの CORS・誤った直リンクを避ける）
 */
@Service
@RequiredArgsConstructor
public class ZipSearchService {

    private static final String ZIPCLOUD_SEARCH = "https://zipcloud.ibsnet.co.jp/api/search";

    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.create();

    /**
     * ZipCloud の JSON をパースしたツリーを返す（Spring がオブジェクトとして1回だけ JSON 化する）。
     *
     * @param zipcode 7桁半角数字のみ想定（コントローラで検証）
     */
    public JsonNode fetchZipCloudJson(String zipcode) {
        URI uri = UriComponentsBuilder.fromUriString(ZIPCLOUD_SEARCH)
                .queryParam("zipcode", zipcode)
                .build(true)
                .toUri();

        String raw = restClient.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        if (raw == null || raw.isBlank()) {
            throw new RestClientException("ZipCloud returned empty body");
        }
        try {
            return objectMapper.readTree(raw);
        } catch (JsonProcessingException e) {
            throw new RestClientException("ZipCloud returned invalid JSON", e);
        }
    }
}
