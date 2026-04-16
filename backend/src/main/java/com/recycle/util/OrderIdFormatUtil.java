package com.recycle.util;

/**
 * 注文IDの表示用フォーマット。
 */
public final class OrderIdFormatUtil {

    private OrderIdFormatUtil() {
    }

    public static String formatOrderId(Long orderId) {
        if (orderId == null) {
            return "";
        }
        return String.format("%010d", orderId);
    }
}