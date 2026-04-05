package com.recycle.enums;

/**
 * 回収注文のライフサイクル（業務要件 docs/04_business_requirements.md と一致）。
 * DB には {@link Enum#name()} の英字を VARCHAR で保存する。
 */
public enum OrderStatus {
    /** 申込受付 */
    RECEIVED,
    /** 梱包キット発送済 */
    KIT_SHIPPED,
    /** 運送業者回収中 */
    COLLECTING,
    /** センター到着 */
    ARRIVED,
    /** データ消去・査定中 */
    PROCESSING,
    /** 処理完了 */
    COMPLETED,
    /** キャンセル */
    CANCELLED
}
