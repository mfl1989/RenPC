package com.recycle.service;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.recycle.dto.OrderDetailResponseDTO;
import com.recycle.dto.OrderInternalNoteHistoryResponseDTO;
import com.recycle.dto.OrderListPageDTO;
import com.recycle.dto.OrderListResponseDTO;
import com.recycle.dto.OrderLookupResponseDTO;
import com.recycle.dto.OrderPricingConfirmRequestDTO;
import com.recycle.dto.OrderStatusHistoryResponseDTO;
import com.recycle.dto.OrderStatusUpdateRequestDTO;
import com.recycle.dto.OrderSubmitRequestDTO;
import com.recycle.dto.OrderSubmitResponseDTO;
import com.recycle.entity.Contact;
import com.recycle.entity.OrderInternalNoteHistory;
import com.recycle.entity.OrderStatusHistory;
import com.recycle.entity.RecycleOrder;
import com.recycle.enums.OrderStatus;
import com.recycle.exception.ResourceNotFoundException;
import com.recycle.repository.ContactRepository;
import com.recycle.repository.OrderInternalNoteHistoryRepository;
import com.recycle.repository.OrderStatusHistoryRepository;
import com.recycle.repository.OrderSubmissionIdempotencyRepository;
import com.recycle.repository.RecycleOrderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 回収申込の受付（連絡先 upsert と注文作成）。
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class OrderService {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter CREATED_AT_FORMAT = DateTimeFormatter.ofPattern("uuuu/MM/dd HH:mm")
            .withZone(JST);
    private static final DateTimeFormatter COLLECTION_DATE_FORMAT = DateTimeFormatter.ofPattern("uuuu年M月d日",
            Locale.JAPAN);
    private static final int BASE_LOGISTICS_FEE_YEN_TAX_IN = 1848;
    private static final int DATA_ERASURE_FEE_YEN = 3000;
    private static final int CARDBOARD_DELIVERY_FEE_YEN = 550;

    private static final Map<String, String> TIME_SLOT_LABELS = Map.ofEntries(
            Map.entry("unspecified", "指定なし"),
            Map.entry("morning", "午前中"),
            Map.entry("t12_14", "12時〜14時"),
            Map.entry("t14_16", "14時〜16時"),
            Map.entry("t16_18", "16時〜18時"),
            Map.entry("t18_21", "18時〜21時"));

    private static final Map<String, String> DATA_ERASURE_OPTION_LABELS = Map.ofEntries(
            Map.entry("self_erase_free", "ご自身で事前に消去する"),
            Map.entry("full_service_paid", "おまかせ消去サービスを利用"));

    private static final Map<OrderStatus, String> ORDER_STATUS_LABELS = Map.ofEntries(
            Map.entry(OrderStatus.RECEIVED, "受付済"),
            Map.entry(OrderStatus.KIT_SHIPPED, "キット発送済"),
            Map.entry(OrderStatus.COLLECTING, "回収中"),
            Map.entry(OrderStatus.ARRIVED, "到着済"),
            Map.entry(OrderStatus.PROCESSING, "処理中"),
            Map.entry(OrderStatus.COMPLETED, "完了"),
            Map.entry(OrderStatus.CANCELLED, "キャンセル"));

    private static final Map<OrderStatus, String> ORDER_PROGRESS_SUMMARIES = Map.ofEntries(
            Map.entry(OrderStatus.RECEIVED, "担当者が内容を確認しています。確認後にご連絡します。"),
            Map.entry(OrderStatus.KIT_SHIPPED, "梱包用キットの発送手配が完了しています。"),
            Map.entry(OrderStatus.COLLECTING, "回収日の訪問準備を進めています。"),
            Map.entry(OrderStatus.ARRIVED, "回収品が到着し、受領確認を進めています。"),
            Map.entry(OrderStatus.PROCESSING, "回収品の確認と処理作業を進めています。"),
            Map.entry(OrderStatus.COMPLETED, "一連の回収対応が完了しました。"),
            Map.entry(OrderStatus.CANCELLED, "お申し込みはキャンセル扱いとなっています。"));

    private final ContactRepository contactRepository;
    private final OrderSubmissionIdempotencyRepository orderSubmissionIdempotencyRepository;
    private final RecycleOrderRepository recycleOrderRepository;
    private final OrderInternalNoteHistoryRepository orderInternalNoteHistoryRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final OrderNotificationService orderNotificationService;
    private final Clock clock;

    /**
     * 申込を登録し、発行した注文 ID を返す。
     *
     * @param dto 検証済みリクエスト
     * @return 保存後の注文 ID
     */
    @Transactional
    public OrderSubmitResponseDTO submitOrder(OrderSubmitRequestDTO dto) {
        String idempotencyKey = normalizeIdempotencyKey(dto.getIdempotencyKey());
        Optional<Long> existingOrderId = orderSubmissionIdempotencyRepository.findCompletedOrderId(idempotencyKey);
        if (existingOrderId.isPresent()) {
            log.info("回収申込の重複送信を検知したため既存注文を返します。orderId={}", existingOrderId.get());
            return OrderSubmitResponseDTO.builder().orderId(existingOrderId.get()).build();
        }

        if (!orderSubmissionIdempotencyRepository.tryReserve(idempotencyKey)) {
            Optional<Long> reservedOrderId = orderSubmissionIdempotencyRepository.findCompletedOrderId(idempotencyKey);
            if (reservedOrderId.isPresent()) {
                log.info("回収申込の重複送信を検知したため既存注文を返します。orderId={}", reservedOrderId.get());
                return OrderSubmitResponseDTO.builder().orderId(reservedOrderId.get()).build();
            }
            if (orderSubmissionIdempotencyRepository.hasActiveReservation(idempotencyKey)) {
                throw new IllegalArgumentException("同一申込を処理中です。完了画面が表示されるまでそのままお待ちください");
            }
        }

        String email = dto.getEmail().trim();
        Contact contact = contactRepository
                .findByEmail(email)
                .map(existing -> updateContactFromDto(existing, dto))
                .orElseGet(() -> createContactFromDto(email, dto));

        Contact savedContact = contactRepository.save(contact);

        RecycleOrder order = buildOrder(savedContact, dto);
        RecycleOrder saved = recycleOrderRepository.save(order);
        orderSubmissionIdempotencyRepository.attachOrder(idempotencyKey, saved.getId());

        orderNotificationService.sendOrderSubmitted(
                saved,
                formatOrderStatus(saved.getOrderStatus()),
                formatOrderProgressSummary(saved.getOrderStatus()));

        log.info("回収申込を受け付けました。orderId={}", saved.getId());

        return OrderSubmitResponseDTO.builder().orderId(saved.getId()).build();
    }

    /**
     * 管理画面用：注文一覧（作成日時の新しい順）。Entity は返さず DTO ページに変換する。
     */
    @Transactional(readOnly = true)
    public OrderListPageDTO getAdminOrderList(Pageable pageable) {
        Page<RecycleOrder> page = recycleOrderRepository.findAll(pageable);
        List<OrderListResponseDTO> content = page.getContent().stream().map(this::toOrderListResponse).toList();
        return OrderListPageDTO.builder()
                .content(content)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
    }

    /**
     * 管理画面用：注文ステータス更新。
     * 楽観的ロック（version）と状態逆行禁止ルールを適用する。
     */
    @Transactional
    public void updateAdminOrderStatus(Long orderId, OrderStatusUpdateRequestDTO dto) {
        RecycleOrder order = recycleOrderRepository
                .findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("指定された注文が存在しません"));

        if (dto.getVersion() == null || !dto.getVersion().equals(order.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(RecycleOrder.class, orderId);
        }

        OrderStatus nextStatus = parseStatus(dto.getStatus());
        OrderStatus currentStatus = order.getOrderStatus();
        boolean statusChanged = currentStatus != nextStatus;

        if (!isValidStatusTransition(currentStatus, nextStatus)) {
            throw new IllegalArgumentException("不正なステータス遷移です");
        }
        if (nextStatus == OrderStatus.COMPLETED && !isPricingConfirmed(order)) {
            throw new IllegalArgumentException("完了にする前に正式料金を確定してください");
        }
        if (statusChanged && trimToBlankAsNull(dto.getStatusChangeReason()) == null) {
            throw new IllegalArgumentException("ステータス変更時は理由を入力してください");
        }

        OrderStatus previousStatus = currentStatus;
        order.setOrderStatus(nextStatus);
        String previousInternalNote = trimToBlankAsNull(order.getInternalNote());
        if (dto.getCustomerNote() != null) {
            order.setCustomerNote(trimToBlankAsNull(dto.getCustomerNote()));
        }
        if (dto.getInternalNote() != null) {
            order.setInternalNote(trimToBlankAsNull(dto.getInternalNote()));
        }
        RecycleOrder saved = recycleOrderRepository.save(order);
        recordStatusHistoryIfNeeded(saved, previousStatus, nextStatus, dto.getStatusChangeReason());
        recordInternalNoteHistoryIfNeeded(saved, previousInternalNote, dto.getInternalNote());
        orderNotificationService.sendOrderStatusUpdated(
                saved,
                formatOrderStatus(saved.getOrderStatus()),
                formatOrderProgressSummary(saved.getOrderStatus()));
    }

    /**
     * 管理画面用：正式料金を確定する。
     */
    @Transactional
    public void confirmAdminOrderPricing(Long orderId, OrderPricingConfirmRequestDTO dto) {
        RecycleOrder order = recycleOrderRepository
                .findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("指定された注文が存在しません"));

        if (dto.getVersion() == null || !dto.getVersion().equals(order.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(RecycleOrder.class, orderId);
        }
        if (order.getOrderStatus() == OrderStatus.COMPLETED || order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("完了済みまたはキャンセル済みの注文では料金確定を更新できません");
        }

        String confirmationNote = trimToBlankAsNull(dto.getPricingConfirmationNote());
        if (confirmationNote == null) {
            throw new IllegalArgumentException("料金確定メモを入力してください");
        }

        order.setFinalAmount(dto.getFinalAmount());
        order.setPricingConfirmedAt(Instant.now(clock));
        order.setPricingConfirmedBy(currentOperator());
        order.setPricingConfirmationNote(confirmationNote);

        RecycleOrder saved = recycleOrderRepository.save(order);
        orderNotificationService.sendOrderPricingConfirmed(
                saved,
                formatOrderStatus(saved.getOrderStatus()),
                "正式料金が確定しました。注文照会ページで金額をご確認いただけます。");
        log.info("正式料金を確定しました。orderId={}, finalAmount={}, operator={}", saved.getId(),
                saved.getFinalAmount(), saved.getPricingConfirmedBy());
    }

    private OrderListResponseDTO toOrderListResponse(RecycleOrder o) {
        Instant created = o.getCreatedAt();
        String createdAtStr = created != null ? CREATED_AT_FORMAT.format(created) : "";

        return OrderListResponseDTO.builder()
                .orderId(o.getId())
                .contactName(o.getCustomerNameKanji())
                .contactPhone(o.getPhone())
                .collectionDate(o.getCollectionDate().format(COLLECTION_DATE_FORMAT))
                .collectionTime(formatTimeSlot(o.getCollectionTimeSlot()))
                .orderStatus(o.getOrderStatus().name())
                .totalAmount(o.getTotalAmount())
                .pricingConfirmed(isPricingConfirmed(o))
                .finalAmount(o.getFinalAmount())
                .createdAt(createdAtStr)
                .version(o.getVersion())
                .build();
    }

    private static String formatTimeSlot(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        return TIME_SLOT_LABELS.getOrDefault(code, code);
    }

    private static String formatOrderStatus(OrderStatus status) {
        if (status == null) {
            return "";
        }
        return ORDER_STATUS_LABELS.getOrDefault(status, status.name());
    }

    private static String formatOrderProgressSummary(OrderStatus status) {
        if (status == null) {
            return "";
        }
        return ORDER_PROGRESS_SUMMARIES.getOrDefault(status, "現在の進捗を確認中です。");
    }

    private static OrderStatus parseStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            throw new IllegalArgumentException("ステータスを指定してください");
        }
        try {
            return OrderStatus.valueOf(rawStatus.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("ステータスの値が不正です");
        }
    }

    /**
     * docs/04_business_requirements.md:
     * - 状態逆行は禁止
     * - COMPLETED/CANCELLED は終端状態
     */
    private static boolean isValidStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == null || next == null) {
            return false;
        }
        if (current == next) {
            return true;
        }
        if (current == OrderStatus.COMPLETED || current == OrderStatus.CANCELLED) {
            return false;
        }
        if (next == OrderStatus.CANCELLED) {
            return true;
        }
        return next.ordinal() > current.ordinal();
    }

    private Contact createContactFromDto(String email, OrderSubmitRequestDTO dto) {
        return Contact.builder()
                .email(email)
                .name(trimToNull(dto.getCustomerNameKanji()))
                .kana(trimToNull(dto.getCustomerNameKana()))
                .phone(normalizePhone(dto.getPhone()))
                .zipCode(dto.getPostalCode())
                .prefecture(trimToNull(dto.getPrefecture()))
                .city(trimToNull(dto.getCity()))
                .addressLine1(trimToNull(dto.getAddressLine1()))
                .addressLine2(trimToBlankAsNull(dto.getAddressLine2()))
                .identityVerified(false)
                .build();
    }

    private Contact updateContactFromDto(Contact contact, OrderSubmitRequestDTO dto) {
        contact.setName(trimToNull(dto.getCustomerNameKanji()));
        contact.setKana(trimToNull(dto.getCustomerNameKana()));
        contact.setPhone(normalizePhone(dto.getPhone()));
        contact.setZipCode(dto.getPostalCode());
        contact.setPrefecture(trimToNull(dto.getPrefecture()));
        contact.setCity(trimToNull(dto.getCity()));
        contact.setAddressLine1(trimToNull(dto.getAddressLine1()));
        contact.setAddressLine2(trimToBlankAsNull(dto.getAddressLine2()));
        return contact;
    }

    private RecycleOrder buildOrder(Contact contact, OrderSubmitRequestDTO dto) {
        Instant termsAt = Instant.now(clock);
        LocalDate collectionDate = LocalDate.parse(dto.getCollectionDate());

        return RecycleOrder.builder()
                .contact(contact)
                .orderStatus(OrderStatus.RECEIVED)
                .collectionDate(collectionDate)
                .collectionTimeSlot(dto.getTimeSlot())
                .totalAmount(calculateTotalAmount(dto))
                .pcCount(dto.getPcCount())
                .monitorCount(dto.getMonitorCount())
                .smallApplianceBoxCount(dto.getSmallApplianceBoxCount())
                .dataErasureOption(dto.getDataErasureOption())
                .cardboardDeliveryRequested(Boolean.TRUE.equals(dto.getCardboardDeliveryRequested()))
                .termsAcceptedAt(termsAt)
                .customerNameKanji(trimToNull(dto.getCustomerNameKanji()))
                .customerNameKana(trimToNull(dto.getCustomerNameKana()))
                .postalCode(dto.getPostalCode())
                .prefecture(trimToNull(dto.getPrefecture()))
                .city(trimToNull(dto.getCity()))
                .addressLine1(trimToNull(dto.getAddressLine1()))
                .addressLine2(trimToBlankAsNull(dto.getAddressLine2()))
                .phone(normalizePhone(dto.getPhone()))
                .email(contact.getEmail())
                .build();
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String trimToBlankAsNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String normalizeIdempotencyKey(String key) {
        String normalized = trimToNull(key);
        if (normalized == null) {
            throw new IllegalArgumentException("送信識別子がありません。画面を再読み込みしてからもう一度お試しください");
        }
        return normalized;
    }

    /** DB 規範に合わせ、電話番号から数字以外を除去して保存する。 */
    private static String normalizePhone(String phone) {
        if (phone == null) {
            return null;
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() > 15) {
            return digits.substring(0, 15);
        }
        return digits;
    }

    /**
     * 管理画面用：注文一覧。検索キーワード（ID, 氏名, 電話番号）に対応。
     */
    @Transactional(readOnly = true)
    public OrderListPageDTO getAdminOrderList(String keyword, Pageable pageable) {
        Page<RecycleOrder> page = searchAdminOrders(keyword, pageable);

        List<OrderListResponseDTO> content = page.getContent().stream().map(this::toOrderListResponse).toList();

        return OrderListPageDTO.builder()
                .content(content)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .build();
    }

    /**
     * 管理画面用：注文一覧を CSV 形式で返す。
     */
    @Transactional(readOnly = true)
    public String exportOrdersToCsv(String keyword) {
        List<RecycleOrder> orders = searchAdminOrders(keyword, Pageable.unpaged()).getContent();

        StringBuilder csv = new StringBuilder();
        csv.append('\ufeff');
        csv.append("注文ID,氏名,電話番号,ステータス,受付金額,正式金額,料金状態,申込日時\n");

        for (RecycleOrder order : orders) {
            csv.append(csvCell(String.valueOf(order.getId()))).append(",");
            csv.append(csvCell(order.getCustomerNameKanji())).append(",");
            csv.append(csvCell(order.getPhone())).append(",");
            csv.append(csvCell(formatOrderStatus(order.getOrderStatus()))).append(",");
            csv.append(csvCell(String.valueOf(order.getTotalAmount()))).append(",");
            csv.append(csvCell(order.getFinalAmount() == null ? "" : String.valueOf(order.getFinalAmount())))
                    .append(",");
            csv.append(csvCell(isPricingConfirmed(order) ? "正式料金確定済" : "受付金額（未確定）")).append(",");
            csv.append(csvCell(formatCreatedAt(order.getCreatedAt()))).append("\n");
        }

        return csv.toString();
    }

    /**
     * 管理画面用：単一注文の詳細を返す。
     */
    @Transactional(readOnly = true)
    public OrderDetailResponseDTO getAdminOrderDetail(Long orderId) {
        RecycleOrder order = recycleOrderRepository
                .findById(orderId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "該当する注文が見つかりません。orderId=" + orderId));

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .version(order.getVersion())
                .orderStatus(formatOrderStatus(order.getOrderStatus()))
                .collectionDate(order.getCollectionDate().format(COLLECTION_DATE_FORMAT))
                .collectionTimeSlot(formatTimeSlot(order.getCollectionTimeSlot()))
                .totalAmount(order.getTotalAmount())
                .pricingConfirmed(isPricingConfirmed(order))
                .finalAmount(order.getFinalAmount())
                .pricingConfirmedAt(formatCreatedAt(order.getPricingConfirmedAt()))
                .pricingConfirmedBy(order.getPricingConfirmedBy())
                .pricingConfirmationNote(order.getPricingConfirmationNote())
                .createdAt(formatCreatedAt(order.getCreatedAt()))
                .lastUpdatedAt(formatLastUpdatedAt(order))
                .pcCount(order.getPcCount())
                .monitorCount(order.getMonitorCount())
                .smallApplianceBoxCount(order.getSmallApplianceBoxCount())
                .dataErasureOption(order.getDataErasureOption())
                .cardboardDeliveryRequested(order.isCardboardDeliveryRequested())
                .customerNameKanji(order.getCustomerNameKanji())
                .customerNameKana(order.getCustomerNameKana())
                .postalCode(order.getPostalCode())
                .prefecture(order.getPrefecture())
                .city(order.getCity())
                .addressLine1(order.getAddressLine1())
                .addressLine2(order.getAddressLine2())
                .phone(order.getPhone())
                .email(order.getEmail())
                .customerNote(order.getCustomerNote())
                .internalNote(order.getInternalNote())
                .internalNoteHistories(getInternalNoteHistories(order.getId()))
                .statusHistories(getStatusHistories(order.getId()))
                .build();
    }

    /**
     * 申込者向け：注文番号とメールアドレスで注文状態を照会する。
     */
    @Transactional(readOnly = true)
    public OrderLookupResponseDTO lookupOrder(Long orderId, String email) {
        String normalizedEmail = trimToNull(email);
        if (orderId == null || normalizedEmail == null) {
            throw new ResourceNotFoundException("該当するお申し込みが見つかりません。");
        }

        RecycleOrder order = recycleOrderRepository
                .findByIdAndEmailIgnoreCase(orderId, normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("該当するお申し込みが見つかりません。"));

        return OrderLookupResponseDTO.builder()
                .orderId(order.getId())
                .contactName(order.getCustomerNameKanji())
                .email(order.getEmail())
                .orderStatusCode(order.getOrderStatus().name())
                .orderStatus(formatOrderStatus(order.getOrderStatus()))
                .progressSummary(formatOrderProgressSummary(order.getOrderStatus()))
                .collectionDate(order.getCollectionDate().format(COLLECTION_DATE_FORMAT))
                .collectionTimeSlot(formatTimeSlot(order.getCollectionTimeSlot()))
                .createdAt(formatCreatedAt(order.getCreatedAt()))
                .lastUpdatedAt(formatLastUpdatedAt(order))
                .totalAmount(order.getTotalAmount())
                .pricingConfirmed(isPricingConfirmed(order))
                .finalAmount(order.getFinalAmount())
                .pricingConfirmedAt(formatCreatedAt(order.getPricingConfirmedAt()))
                .pcCount(order.getPcCount())
                .monitorCount(order.getMonitorCount())
                .smallApplianceBoxCount(order.getSmallApplianceBoxCount())
                .dataErasureOptionLabel(formatDataErasureOption(order.getDataErasureOption()))
                .cardboardDeliveryLabel(formatCardboardDelivery(order.isCardboardDeliveryRequested()))
                .customerNote(order.getCustomerNote())
                .build();
    }

    private static boolean isPricingConfirmed(RecycleOrder order) {
        return order != null && order.getFinalAmount() != null && order.getPricingConfirmedAt() != null;
    }

    private static int calculateTotalAmount(OrderSubmitRequestDTO dto) {
        int total = 0;
        if (dto.getPcCount() == null || dto.getPcCount() <= 0) {
            total += BASE_LOGISTICS_FEE_YEN_TAX_IN;
        }
        if ("full_service_paid".equals(dto.getDataErasureOption())) {
            total += DATA_ERASURE_FEE_YEN;
        }
        if (Boolean.TRUE.equals(dto.getCardboardDeliveryRequested())) {
            total += CARDBOARD_DELIVERY_FEE_YEN;
        }
        return total;
    }

    private Page<RecycleOrder> searchAdminOrders(String keyword, Pageable pageable) {
        String trimmedKeyword = trimToNull(keyword);
        String phoneKeyword = normalizeDigits(trimmedKeyword);
        if (trimmedKeyword == null) {
            return recycleOrderRepository.findAll(pageable);
        }
        return recycleOrderRepository.findAllWithKeyword(trimmedKeyword, phoneKeyword, pageable);
    }

    private static String normalizeDigits(String value) {
        if (value == null) {
            return "";
        }
        String digits = value.replaceAll("\\D", "");
        return digits;
    }

    private static String formatCreatedAt(Instant createdAt) {
        if (createdAt == null) {
            return "";
        }
        return CREATED_AT_FORMAT.format(createdAt);
    }

    private static String formatDataErasureOption(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        return DATA_ERASURE_OPTION_LABELS.getOrDefault(code, code);
    }

    private static String formatCardboardDelivery(boolean requested) {
        return requested ? "希望する" : "希望しない";
    }

    private static String formatLastUpdatedAt(RecycleOrder order) {
        if (order == null) {
            return "";
        }
        Instant updatedAt = order.getUpdatedAt();
        if (updatedAt == null) {
            updatedAt = order.getCreatedAt();
        }
        return formatCreatedAt(updatedAt);
    }

    private static String currentOperator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "system";
        }
        return authentication.getName();
    }

    private static String csvCell(String value) {
        if (value == null) {
            return "\"\"";
        }
        String normalized = value.replace("\r\n", " ").replace("\n", " ").replace("\r", " ");
        return "\"" + normalized.replace("\"", "\"\"") + "\"";
    }

    private void recordInternalNoteHistoryIfNeeded(RecycleOrder order, String previousInternalNote,
            String requestedInternalNote) {
        if (requestedInternalNote == null) {
            return;
        }

        String currentInternalNote = trimToBlankAsNull(order.getInternalNote());
        if (Objects.equals(previousInternalNote, currentInternalNote)) {
            return;
        }

        Instant changedAt = Instant.now(clock);
        orderInternalNoteHistoryRepository.save(OrderInternalNoteHistory.builder()
                .recycleOrder(order)
                .previousNote(previousInternalNote)
                .newNote(currentInternalNote)
                .changedBy(resolveCurrentAuditor())
                .changedAt(changedAt)
                .build());
    }

    private void recordStatusHistoryIfNeeded(RecycleOrder order, OrderStatus previousStatus, OrderStatus newStatus,
            String statusChangeReason) {
        if (previousStatus == null || newStatus == null || previousStatus == newStatus) {
            return;
        }

        Instant changedAt = Instant.now(clock);
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .recycleOrder(order)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changedBy(resolveCurrentAuditor())
                .changeReason(trimToBlankAsNull(statusChangeReason))
                .changedAt(changedAt)
                .build());
    }

    private List<OrderInternalNoteHistoryResponseDTO> getInternalNoteHistories(Long orderId) {
        return orderInternalNoteHistoryRepository.findByRecycleOrderIdOrderByChangedAtDesc(orderId)
                .stream()
                .map(history -> OrderInternalNoteHistoryResponseDTO.builder()
                        .historyId(history.getId())
                        .previousNote(history.getPreviousNote())
                        .newNote(history.getNewNote())
                        .changedBy(resolveHistoryChangedBy(history))
                        .changedAt(formatCreatedAt(history.getChangedAt()))
                        .build())
                .toList();
    }

    private List<OrderStatusHistoryResponseDTO> getStatusHistories(Long orderId) {
        return orderStatusHistoryRepository.findByRecycleOrderIdOrderByChangedAtDesc(orderId)
                .stream()
                .map(history -> OrderStatusHistoryResponseDTO.builder()
                        .historyId(history.getId())
                        .previousStatus(formatOrderStatus(history.getPreviousStatus()))
                        .newStatus(formatOrderStatus(history.getNewStatus()))
                        .changedBy(resolveHistoryChangedBy(history.getChangedBy(), history.getCreatedBy()))
                        .changedAt(formatCreatedAt(history.getChangedAt()))
                        .changeReason(history.getChangeReason())
                        .build())
                .toList();
    }

    private static String resolveHistoryChangedBy(OrderInternalNoteHistory history) {
        return resolveHistoryChangedBy(history.getChangedBy(), history.getCreatedBy());
    }

    private static String resolveHistoryChangedBy(String changedBy, String createdBy) {
        if (changedBy != null && !changedBy.isBlank()) {
            return changedBy;
        }
        if (createdBy != null && !createdBy.isBlank()) {
            return createdBy;
        }
        return "system";
    }

    private static String resolveCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "system";
        }
        String name = authentication.getName();
        return (name == null || name.isBlank()) ? "system" : name;
    }

}
