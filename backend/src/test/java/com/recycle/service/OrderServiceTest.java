package com.recycle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recycle.dto.OrderDetailResponseDTO;
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
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RecycleOrderRepository recycleOrderRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-15T00:30:00Z"), ZoneId.of("Asia/Tokyo"));
        orderService = new OrderService(userRepository, recycleOrderRepository, passwordEncoder, fixedClock);
    }

    @Test
    void getAdminOrderList_normalizesPhoneKeywordBeforeQuery() {
        Pageable pageable = Pageable.ofSize(20);
        when(recycleOrderRepository.findAllWithKeyword(any(), any(), eq(pageable)))
                .thenReturn(new PageImpl<>(java.util.List.of(), pageable, 0));

        orderService.getAdminOrderList("090-1234-5678", pageable);

        verify(recycleOrderRepository)
                .findAllWithKeyword("090-1234-5678", "09012345678", pageable);
    }

    @Test
    void exportOrdersToCsv_escapesSpecialCharactersAndFormatsDisplayValues() {
        RecycleOrder order = buildOrder();
        order.setCustomerNameKanji("田中 \"一郎\"\n様");
        when(recycleOrderRepository.findAll(eq(Pageable.unpaged())))
                .thenReturn(new PageImpl<>(java.util.List.of(order)));

        String csv = orderService.exportOrdersToCsv(null);

        assertTrue(csv.startsWith("\ufeff"));
        assertTrue(csv.contains("\"田中 \"\"一郎\"\" 様\""));
        assertTrue(csv.contains("\"受付済\""));
        assertTrue(csv.contains("\"2026/04/15 09:30\""));
    }

    @Test
    void getAdminOrderDetail_formatsDisplayFields() {
        RecycleOrder order = buildOrder();
        when(recycleOrderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderDetailResponseDTO detail = orderService.getAdminOrderDetail(1L);

        assertEquals("受付済", detail.getOrderStatus());
        assertEquals("2026年4月20日", detail.getCollectionDate());
        assertEquals("14時〜16時", detail.getCollectionTimeSlot());
        assertEquals("2026/04/15 09:30", detail.getCreatedAt());
    }

    @Test
    void getAdminOrderDetail_throwsWhenOrderDoesNotExist() {
        when(recycleOrderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getAdminOrderDetail(999L));
    }

    private static RecycleOrder buildOrder() {
        User user =
                User.builder()
                        .id(10L)
                        .email("test@example.com")
                        .passwordHash("hashed")
                        .name("田中一郎")
                        .kana("タナカイチロウ")
                        .phone("09012345678")
                        .zipCode("1350061")
                        .prefecture("東京都")
                        .city("江東区")
                        .addressLine1("豊洲1-2-3")
                        .build();

        return RecycleOrder.builder()
                .id(1L)
                .user(user)
                .orderStatus(OrderStatus.RECEIVED)
                .collectionDate(LocalDate.of(2026, 4, 20))
                .collectionTimeSlot("t14_16")
                .totalAmount(3000)
                .pcCount(1)
                .monitorCount(2)
                .smallApplianceBoxCount(1)
                .dataErasureOption("full_service_paid")
                .cardboardDeliveryRequested(true)
                .termsAcceptedAt(Instant.parse("2026-04-15T00:30:00Z"))
                .customerNameKanji("田中一郎")
                .customerNameKana("タナカイチロウ")
                .postalCode("1350061")
                .prefecture("東京都")
                .city("江東区")
                .addressLine1("豊洲1-2-3")
                .addressLine2("サンプルマンション101")
                .phone("09012345678")
                .email("test@example.com")
                .createdAt(Instant.parse("2026-04-15T00:30:00Z"))
                .build();
    }
}