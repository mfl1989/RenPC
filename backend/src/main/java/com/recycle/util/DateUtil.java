package com.recycle.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * 日付ユーティリティ。
 */
public final class DateUtil {

    private static final DateTimeFormatter JP_DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm");

    private static final DateTimeFormatter ISO_LOCAL_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private DateUtil() {
        // Utility class
    }

    /**
     * LocalDateTime を日本向け表示形式（yyyy年MM月dd日 HH:mm）へ変換する。
     *
     * @param dateTime 変換対象
     * @return 変換済み文字列（引数が null の場合は空文字）
     */
    public static String formatToJapaneseDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return JP_DATE_TIME_FORMATTER.format(dateTime);
    }

    /**
     * yyyy-MM-dd 形式の文字列を LocalDate に変換する。
     *
     * @param dateText 日付文字列
     * @return 変換済み LocalDate
     * @throws IllegalArgumentException null/空文字/不正形式の場合
     */
    public static LocalDate parseToLocalDate(String dateText) {
        if (dateText == null || dateText.isBlank()) {
            throw new IllegalArgumentException("日付文字列が未指定です。yyyy-MM-dd 形式で指定してください。");
        }

        try {
            return LocalDate.parse(dateText.trim(), ISO_LOCAL_DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(
                    "日付形式が不正です。yyyy-MM-dd 形式で指定してください: " + dateText, e);
        }
    }
}

