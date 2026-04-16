package com.recycle.service;

import com.recycle.dto.OrderDetailResponseDTO;
import com.recycle.dto.OrderListPageDTO;
import com.recycle.dto.OrderListResponseDTO;
import com.recycle.dto.OrderStatusUpdateRequestDTO;
import com.recycle.dto.OrderSubmitRequestDTO;
import com.recycle.dto.OrderSubmitResponseDTO;
import com.recycle.entity.RecycleOrder;
import com.recycle.entity.User;
import com.recycle.enums.OrderStatus;
import com.recycle.exception.ResourceNotFoundException;
import com.recycle.repository.RecycleOrderRepository;
import com.recycle.repository.UserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 回収申込の受付（ユーザー upsert と注文作成）。
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter CREATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("uuuu/MM/dd HH:mm").withZone(JST);
    private static final DateTimeFormatter COLLECTION_DATE_FORMAT =
            DateTimeFormatter.ofPattern("uuuu年M月d日", Locale.JAPAN);

    private static final Map<String, String> TIME_SLOT_LABELS =
            Map.ofEntries(
                    Map.entry("unspecified", "指定なし"),
                    Map.entry("morning", "午前中"),
                    Map.entry("t12_14", "12時〜14時"),
                    Map.entry("t14_16", "14時〜16時"),
                    Map.entry("t16_18", "16時〜18時"),
                    Map.entry("t18_21", "18時〜21時"));

        private static final Map<OrderStatus, String> ORDER_STATUS_LABELS =
            Map.ofEntries(
                Map.entry(OrderStatus.RECEIVED, "受付済"),
                Map.entry(OrderStatus.KIT_SHIPPED, "キット発送済"),
                Map.entry(OrderStatus.COLLECTING, "回収中"),
                Map.entry(OrderStatus.ARRIVED, "到着済"),
                Map.entry(OrderStatus.PROCESSING, "処理中"),
                Map.entry(OrderStatus.COMPLETED, "完了"),
                Map.entry(OrderStatus.CANCELLED, "キャンセル"));

    private final UserRepository userRepository;
    private final RecycleOrderRepository recycleOrderRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    /**
     * 申込を登録し、発行した注文 ID を返す。
     *
     * @param dto 検証済みリクエスト
     * @return 保存後の注文 ID
     */
    @Transactional
    public OrderSubmitResponseDTO submitOrder(OrderSubmitRequestDTO dto) {
        String email = dto.getEmail().trim();
        User user =
                userRepository
                        .findByEmail(email)
                        .map(existing -> updateUserFromDto(existing, dto))
                        .orElseGet(() -> createUserFromDto(email, dto));

        User savedUser = userRepository.save(user);

        RecycleOrder order = buildOrder(savedUser, dto);
        RecycleOrder saved = recycleOrderRepository.save(order);

        log.info("回収申込を受け付けました。orderId={}", saved.getId());

        return OrderSubmitResponseDTO.builder().orderId(saved.getId()).build();
    }

    /**
     * 管理画面用：注文一覧（作成日時の新しい順）。Entity は返さず DTO ページに変換する。
     */
    @Transactional(readOnly = true)
    public OrderListPageDTO getAdminOrderList(Pageable pageable) {
        Page<RecycleOrder> page = recycleOrderRepository.findAll(pageable);
        List<OrderListResponseDTO> content =
                page.getContent().stream().map(this::toOrderListResponse).toList();
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
        RecycleOrder order =
                recycleOrderRepository
                        .findById(orderId)
                        .orElseThrow(() -> new IllegalArgumentException("指定された注文が存在しません"));

        if (dto.getVersion() == null || !dto.getVersion().equals(order.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(RecycleOrder.class, orderId);
        }

        OrderStatus nextStatus = parseStatus(dto.getStatus());
        OrderStatus currentStatus = order.getOrderStatus();

        if (!isValidStatusTransition(currentStatus, nextStatus)) {
            throw new IllegalArgumentException("不正なステータス遷移です");
        }

        order.setOrderStatus(nextStatus);
        recycleOrderRepository.save(order);
    }

    private OrderListResponseDTO toOrderListResponse(RecycleOrder o) {
        Instant created = o.getCreatedAt();
        String createdAtStr =
                created != null ? CREATED_AT_FORMAT.format(created) : "";

        return OrderListResponseDTO.builder()
                .orderId(o.getId())
                .userName(o.getCustomerNameKanji())
                .userPhone(o.getPhone())
                .collectionDate(o.getCollectionDate().format(COLLECTION_DATE_FORMAT))
                .collectionTime(formatTimeSlot(o.getCollectionTimeSlot()))
                .orderStatus(o.getOrderStatus().name())
                .totalAmount(o.getTotalAmount())
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

    private User createUserFromDto(String email, OrderSubmitRequestDTO dto) {
        return User.builder()
                .email(email)
                .role("USER")
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
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

    private User updateUserFromDto(User user, OrderSubmitRequestDTO dto) {
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setName(trimToNull(dto.getCustomerNameKanji()));
        user.setKana(trimToNull(dto.getCustomerNameKana()));
        user.setPhone(normalizePhone(dto.getPhone()));
        user.setZipCode(dto.getPostalCode());
        user.setPrefecture(trimToNull(dto.getPrefecture()));
        user.setCity(trimToNull(dto.getCity()));
        user.setAddressLine1(trimToNull(dto.getAddressLine1()));
        user.setAddressLine2(trimToBlankAsNull(dto.getAddressLine2()));
        return user;
    }

    private RecycleOrder buildOrder(User user, OrderSubmitRequestDTO dto) {
        Instant termsAt = Instant.now(clock);
        LocalDate collectionDate = LocalDate.parse(dto.getCollectionDate());

        return RecycleOrder.builder()
                .user(user)
                .orderStatus(OrderStatus.RECEIVED)
                .collectionDate(collectionDate)
                .collectionTimeSlot(dto.getTimeSlot())
                .totalAmount(0)
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
                .email(user.getEmail())
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

        List<OrderListResponseDTO> content =
                page.getContent().stream().map(this::toOrderListResponse).toList();

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
        csv.append("注文ID,氏名,電話番号,ステータス,金額,申込日時\n");

        for (RecycleOrder order : orders) {
            csv.append(csvCell(String.valueOf(order.getId()))).append(",");
            csv.append(csvCell(order.getCustomerNameKanji())).append(",");
            csv.append(csvCell(order.getPhone())).append(",");
            csv.append(csvCell(formatOrderStatus(order.getOrderStatus()))).append(",");
            csv.append(csvCell(String.valueOf(order.getTotalAmount()))).append(",");
            csv.append(csvCell(formatCreatedAt(order.getCreatedAt()))).append("\n");
        }

        return csv.toString();
    }

    /**
     * 管理画面用：単一注文の詳細を返す。
     */
    @Transactional(readOnly = true)
    public OrderDetailResponseDTO getAdminOrderDetail(Long orderId) {
        RecycleOrder order =
                recycleOrderRepository
                        .findById(orderId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "該当する注文が見つかりません。orderId=" + orderId));

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderStatus(formatOrderStatus(order.getOrderStatus()))
                .collectionDate(order.getCollectionDate().format(COLLECTION_DATE_FORMAT))
                .collectionTimeSlot(formatTimeSlot(order.getCollectionTimeSlot()))
                .totalAmount(order.getTotalAmount())
                .createdAt(formatCreatedAt(order.getCreatedAt()))
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
                .build();
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

    private static String csvCell(String value) {
        if (value == null) {
            return "\"\"";
        }
        String normalized = value.replace("\r\n", " ").replace("\n", " ").replace("\r", " ");
        return "\"" + normalized.replace("\"", "\"\"") + "\"";
    }

}
