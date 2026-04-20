package com.recycle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 管理者による正式料金確定リクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPricingConfirmRequestDTO {

    @NotNull(message = "正式料金を入力してください")
    @Min(value = 0, message = "正式料金は0円以上で入力してください")
    private Integer finalAmount;

    @NotNull(message = "version は必須です")
    private Long version;

    @NotBlank(message = "料金確定メモを入力してください")
    @Size(max = 500, message = "料金確定メモは500文字以内で入力してください")
    private String pricingConfirmationNote;
}