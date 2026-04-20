package com.recycle.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.recycle.common.ApiResponse;
import com.recycle.dto.ContactInquiryDetailResponseDTO;
import com.recycle.dto.ContactInquiryListPageDTO;
import com.recycle.dto.ContactInquiryStatusUpdateRequestDTO;
import com.recycle.service.ContactInquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 管理画面の問い合わせ一覧・詳細 API。
 */
@RestController
@RequestMapping("/api/admin/contact-inquiries")
@RequiredArgsConstructor
public class AdminContactInquiryController {

    private final ContactInquiryService contactInquiryService;

    @GetMapping
    public ApiResponse<ContactInquiryListPageDTO> getInquiries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) Boolean changeRequestOnly,
            @PageableDefault(size = 20, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        ContactInquiryListPageDTO response = contactInquiryService.getAdminInquiryList(keyword, status, assignedTo,
                changeRequestOnly,
                pageable);
        return ApiResponse.ok("成功", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ContactInquiryDetailResponseDTO> getInquiryDetail(@PathVariable Long id) {
        ContactInquiryDetailResponseDTO detail = contactInquiryService.getAdminInquiryDetail(id);
        return ApiResponse.ok("成功", detail);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateInquiry(@PathVariable Long id,
            @Valid @RequestBody ContactInquiryStatusUpdateRequestDTO body) {
        contactInquiryService.updateAdminInquiryStatus(id, body);
        return ApiResponse.ok("成功", null);
    }
}