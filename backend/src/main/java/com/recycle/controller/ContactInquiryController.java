package com.recycle.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.recycle.common.ApiResponse;
import com.recycle.dto.ContactInquirySubmitRequestDTO;
import com.recycle.dto.ContactInquirySubmitResponseDTO;
import com.recycle.service.ContactInquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * ご相談フォーム API。
 */
@RestController
@RequiredArgsConstructor
public class ContactInquiryController {

    private final ContactInquiryService contactInquiryService;

    @PostMapping("/api/contact-inquiries")
    public ApiResponse<ContactInquirySubmitResponseDTO> submit(
            @Valid @RequestBody ContactInquirySubmitRequestDTO body) {
        ContactInquirySubmitResponseDTO data = contactInquiryService.submit(body);
        return ApiResponse.ok("成功", data);
    }
}