package com.recycle.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 申込者向け注文照会リクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderLookupRequestDTO {

    @NotNull(message = "お申し込み番号を入力してください")
    @Positive(message = "お申し込み番号の形式が不正です")
    private Long orderId;

    @NotBlank(message = "メールアドレスを入力してください")
    @Email(message = "メールアドレスの形式が不正です")
    private String email;
}