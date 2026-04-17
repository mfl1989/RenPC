package com.recycle.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ご相談フォームの送信リクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInquirySubmitRequestDTO {

    @NotBlank(message = "お名前を入力してください。")
    @Size(max = 60, message = "お名前は60文字以内で入力してください。")
    private String name;

    @NotBlank(message = "メールアドレスを入力してください。")
    @Email(message = "メールアドレスの形式が正しくありません。")
    private String email;

    @NotBlank(message = "お問い合わせ内容を選択してください。")
    @Pattern(regexp = "^(items|packing|schedule|status|data-erasure|other)$", message = "お問い合わせ内容を選択してください。")
    private String category;

    @Pattern(regexp = "^$|^\\d{1,10}$", message = "お申込み番号は10桁以内の数字で入力してください。")
    private String orderId;

    @NotBlank(message = "お問い合わせ内容は10文字以上で入力してください。")
    @Size(min = 10, max = 1000, message = "お問い合わせ内容は10文字以上1000文字以内で入力してください。")
    private String message;

    @AssertTrue(message = "個人情報保護方針への同意が必要です。")
    private boolean privacyConsent;
}