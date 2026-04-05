package com.recycle.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * フロントの {@code RecycleOrderSchema} と同一の JSON キー（camelCase）に対応する申込リクエスト。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderSubmitRequestDTO {

    @NotNull(message = "パソコン台数を入力してください")
    @Min(value = 0, message = "パソコン台数は0以上99以下で入力してください")
    @Max(value = 99, message = "パソコン台数は0以上99以下で入力してください")
    private Integer pcCount;

    @NotNull(message = "モニター台数を入力してください")
    @Min(value = 0, message = "モニター台数は0以上99以下で入力してください")
    @Max(value = 99, message = "モニター台数は0以上99以下で入力してください")
    private Integer monitorCount;

    @NotNull(message = "小型家電用段ボールの箱数を入力してください")
    @Min(value = 0, message = "小型家電用段ボールの箱数は0以上99以下で入力してください")
    @Max(value = 99, message = "小型家電用段ボールの箱数は0以上99以下で入力してください")
    private Integer smallApplianceBoxCount;

    @NotBlank(message = "データ消去オプションを選択してください")
    @Pattern(
            regexp = "^(self_erase_free|full_service_paid)$",
            message = "データ消去オプションの値が不正です")
    private String dataErasureOption;

    @NotBlank(message = "回収希望日を選択してください")
    @Pattern(
            regexp = "^\\d{4}-\\d{2}-\\d{2}$",
            message = "日付の形式が正しくありません")
    private String collectionDate;

    @NotBlank(message = "回収希望時間帯を選択してください")
    @Pattern(
            regexp = "^(unspecified|morning|t12_14|t14_16|t16_18|t18_21)$",
            message = "回収希望時間帯の値が不正です")
    private String timeSlot;

    @NotNull(message = "段ボール配送希望の指定が必要です")
    private Boolean cardboardDeliveryRequested;

    @NotBlank(message = "氏名（漢字）を入力してください")
    private String customerNameKanji;

    /**
     * 全角カタカナ（長音・中黒・全角スペース・空白を許容）。フロントの KATAKANA_REGEX と同等。
     */
    @NotBlank(message = "氏名（フリガナ）を入力してください")
    @Pattern(
            regexp = "^[\\u30A1-\\u30F6\\u30FC\\u30FB\\u3000\\s]+$",
            message = "フリガナは全角カタカナで入力してください")
    private String customerNameKana;

    @NotBlank(message = "郵便番号を入力してください")
    @Pattern(regexp = "^\\d{7}$", message = "郵便番号は7桁の半角数字で入力してください")
    private String postalCode;

    @NotBlank(message = "都道府県を入力してください")
    private String prefecture;

    @NotBlank(message = "市区町村を入力してください")
    private String city;

    @NotBlank(message = "番地・建物名までを入力してください")
    private String addressLine1;

    private String addressLine2;

    @NotBlank(message = "電話番号を入力してください")
    @Pattern(
            regexp = "^[0-9+\\-()]{10,16}$",
            message = "電話番号の形式をご確認ください")
    private String phone;

    @NotBlank(message = "メールアドレスを入力してください")
    @Email(message = "メールアドレスの形式が正しくありません")
    private String email;

    @NotBlank(message = "パスワードを入力してください")
    @Size(min = 8, message = "パスワードは8文字以上で設定してください")
    private String password;

    @AssertTrue(message = "利用規約に同意してください")
    private boolean termsAccepted;

    @AssertTrue(message = "回収品目を1点以上お選びください")
    public boolean isAtLeastOneLineItem() {
        if (pcCount == null || monitorCount == null || smallApplianceBoxCount == null) {
            return false;
        }
        return pcCount + monitorCount + smallApplianceBoxCount >= 1;
    }
}
