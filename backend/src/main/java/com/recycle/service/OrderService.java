package com.recycle.service;

import com.recycle.dto.OrderListPageDTO;
import com.recycle.dto.OrderListResponseDTO;
import com.recycle.dto.OrderStatusUpdateRequestDTO;
import com.recycle.dto.OrderSubmitRequestDTO;
import com.recycle.dto.OrderSubmitResponseDTO;
import com.recycle.entity.RecycleOrder;
import com.recycle.entity.User;
import com.recycle.enums.OrderStatus;
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
                .build();
    }

    private static String formatTimeSlot(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        return TIME_SLOT_LABELS.getOrDefault(code, code);
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
}
