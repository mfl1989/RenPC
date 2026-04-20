package com.recycle.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.recycle.dto.OrderDetailResponseDTO;
import com.recycle.dto.OrderLookupResponseDTO;
import com.recycle.entity.Contact;
import com.recycle.entity.OrderInternalNoteHistory;
import com.recycle.entity.OrderStatusHistory;
import com.recycle.entity.RecycleOrder;
import com.recycle.enums.OrderStatus;
import com.recycle.exception.ResourceNotFoundException;
import com.recycle.repository.ContactRepository;
import com.recycle.repository.OrderInternalNoteHistoryRepository;
import com.recycle.repository.OrderStatusHistoryRepository;
import com.recycle.repository.RecycleOrderRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class OrderServiceTest {

        @Mock
        private ContactRepository contactRepository;
        @Mock
        private RecycleOrderRepository recycleOrderRepository;
        @Mock
        private OrderInternalNoteHistoryRepository orderInternalNoteHistoryRepository;
        @Mock
        private OrderStatusHistoryRepository orderStatusHistoryRepository;
        @Mock
        private OrderNotificationService orderNotificationService;

        private OrderService orderService;

        @BeforeEach
        void setUp() {
                Clock fixedClock = Clock.fixed(Instant.parse("2026-04-15T00:30:00Z"), ZoneId.of("Asia/Tokyo"));
                orderService = new OrderService(contactRepository, recycleOrderRepository,
                                orderInternalNoteHistoryRepository,
                                orderStatusHistoryRepository,
                                orderNotificationService,
                                fixedClock);
                SecurityContextHolder.clearContext();
        }

        @Test
        void submitOrder_sendsSubmissionNotification() {
                com.recycle.dto.OrderSubmitRequestDTO dto = com.recycle.dto.OrderSubmitRequestDTO.builder()
                                .customerNameKanji("田中一郎")
                                .customerNameKana("タナカイチロウ")
                                .email("test@example.com")
                                .phone("090-1234-5678")
                                .postalCode("1350061")
                                .prefecture("東京都")
                                .city("江東区")
                                .addressLine1("豊洲1-2-3")
                                .collectionDate("2026-04-20")
                                .timeSlot("t14_16")
                                .pcCount(1)
                                .monitorCount(0)
                                .smallApplianceBoxCount(0)
                                .dataErasureOption("none")
                                .cardboardDeliveryRequested(false)
                                .build();
                Contact contact = Contact.builder().id(10L).email("test@example.com").name("田中一郎").build();
                RecycleOrder savedOrder = buildOrder();

                when(contactRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
                when(contactRepository.save(any(Contact.class))).thenReturn(contact);
                when(recycleOrderRepository.save(any(RecycleOrder.class))).thenReturn(savedOrder);

                orderService.submitOrder(dto);

                verify(orderNotificationService).sendOrderSubmitted(any(RecycleOrder.class), eq("受付済"),
                                any(String.class));
        }

        @Test
        void updateAdminOrderStatus_updatesCustomerNoteAndSendsNotification() {
                RecycleOrder order = buildOrder();
                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("admin", null, java.util.List.of()));
                com.recycle.dto.OrderStatusUpdateRequestDTO request = com.recycle.dto.OrderStatusUpdateRequestDTO
                                .builder()
                                .status("KIT_SHIPPED")
                                .version(0L)
                                .customerNote("発送準備が整い次第、追ってご連絡します。")
                                .internalNote("内部で送り状番号を確認中")
                                .statusChangeReason("発送手配が完了したため")
                                .build();
                when(recycleOrderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(recycleOrderRepository.save(any(RecycleOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                orderService.updateAdminOrderStatus(1L, request);

                assertEquals("発送準備が整い次第、追ってご連絡します。", order.getCustomerNote());
                assertEquals("内部で送り状番号を確認中", order.getInternalNote());
                verify(orderInternalNoteHistoryRepository).save(any(OrderInternalNoteHistory.class));
                verify(orderStatusHistoryRepository).save(any(OrderStatusHistory.class));
                verify(orderNotificationService).sendOrderStatusUpdated(any(RecycleOrder.class), eq("キット発送済"),
                                any(String.class));
        }

        @Test
        void updateAdminOrderStatus_preservesNotesWhenRequestDoesNotIncludeThem() {
                RecycleOrder order = buildOrder();
                com.recycle.dto.OrderStatusUpdateRequestDTO request = com.recycle.dto.OrderStatusUpdateRequestDTO
                                .builder()
                                .status("KIT_SHIPPED")
                                .version(0L)
                                .statusChangeReason("発送手配が完了したため")
                                .build();
                when(recycleOrderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(recycleOrderRepository.save(any(RecycleOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                orderService.updateAdminOrderStatus(1L, request);

                assertEquals("管理担当よりご連絡予定です。", order.getCustomerNote());
                assertEquals("内部確認メモです。", order.getInternalNote());
                verify(orderInternalNoteHistoryRepository, never()).save(any(OrderInternalNoteHistory.class));
                verify(orderStatusHistoryRepository).save(any(OrderStatusHistory.class));
        }

        @Test
        void updateAdminOrderStatus_doesNotCreateStatusHistoryWhenStatusIsUnchanged() {
                RecycleOrder order = buildOrder();
                com.recycle.dto.OrderStatusUpdateRequestDTO request = com.recycle.dto.OrderStatusUpdateRequestDTO
                                .builder()
                                .status("RECEIVED")
                                .version(0L)
                                .internalNote("内部確認メモを更新")
                                .build();
                when(recycleOrderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(recycleOrderRepository.save(any(RecycleOrder.class)))
                                .thenAnswer(invocation -> invocation.getArgument(0));

                orderService.updateAdminOrderStatus(1L, request);

                verify(orderStatusHistoryRepository, never()).save(any(OrderStatusHistory.class));
                verify(orderInternalNoteHistoryRepository).save(any(OrderInternalNoteHistory.class));
        }

        @Test
        void updateAdminOrderStatus_requiresReasonWhenStatusChanges() {
                RecycleOrder order = buildOrder();
                com.recycle.dto.OrderStatusUpdateRequestDTO request = com.recycle.dto.OrderStatusUpdateRequestDTO
                                .builder()
                                .status("KIT_SHIPPED")
                                .version(0L)
                                .build();
                when(recycleOrderRepository.findById(1L)).thenReturn(Optional.of(order));

                IllegalArgumentException exception = assertThrows(
                                IllegalArgumentException.class,
                                () -> orderService.updateAdminOrderStatus(1L, request));

                assertEquals("ステータス変更時は理由を入力してください", exception.getMessage());
                verify(orderStatusHistoryRepository, never()).save(any(OrderStatusHistory.class));
                verify(orderNotificationService, never()).sendOrderStatusUpdated(any(), any(), any());
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
                when(orderInternalNoteHistoryRepository.findByRecycleOrderIdOrderByChangedAtDesc(1L))
                                .thenReturn(java.util.List.of(OrderInternalNoteHistory.builder()
                                                .id(50L)
                                                .previousNote("初回メモ")
                                                .newNote("更新後メモ")
                                                .changedBy("admin")
                                                .changedAt(Instant.parse("2026-04-15T01:00:00Z"))
                                                .build()));
                when(orderStatusHistoryRepository.findByRecycleOrderIdOrderByChangedAtDesc(1L))
                                .thenReturn(java.util.List.of(OrderStatusHistory.builder()
                                                .id(60L)
                                                .previousStatus(OrderStatus.RECEIVED)
                                                .newStatus(OrderStatus.KIT_SHIPPED)
                                                .changedBy("admin")
                                                .changeReason("発送手配が完了したため")
                                                .changedAt(Instant.parse("2026-04-15T02:00:00Z"))
                                                .build()));

                OrderDetailResponseDTO detail = orderService.getAdminOrderDetail(1L);

                assertEquals("受付済", detail.getOrderStatus());
                assertEquals("2026年4月20日", detail.getCollectionDate());
                assertEquals("14時〜16時", detail.getCollectionTimeSlot());
                assertEquals("2026/04/15 09:30", detail.getCreatedAt());
                assertEquals(1, detail.getInternalNoteHistories().size());
                assertEquals("admin", detail.getInternalNoteHistories().get(0).getChangedBy());
                assertEquals(1, detail.getStatusHistories().size());
                assertEquals("キット発送済", detail.getStatusHistories().get(0).getNewStatus());
                assertEquals("発送手配が完了したため", detail.getStatusHistories().get(0).getChangeReason());
        }

        @Test
        void getAdminOrderDetail_throwsWhenOrderDoesNotExist() {
                when(recycleOrderRepository.findById(999L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class, () -> orderService.getAdminOrderDetail(999L));
        }

        @Test
        void lookupOrder_returnsPublicStatusSummary() {
                RecycleOrder order = buildOrder();
                when(recycleOrderRepository.findByIdAndEmailIgnoreCase(1L, "test@example.com"))
                                .thenReturn(Optional.of(order));

                OrderLookupResponseDTO result = orderService.lookupOrder(1L, "test@example.com");

                assertEquals(1L, result.getOrderId());
                assertEquals("田中一郎", result.getContactName());
                assertEquals("受付済", result.getOrderStatus());
                assertEquals("2026年4月20日", result.getCollectionDate());
                assertEquals("担当者が内容を確認しています。確認後にご連絡します。", result.getProgressSummary());
                assertEquals("2026/04/15 09:30", result.getLastUpdatedAt());
                assertEquals(1, result.getPcCount());
                assertEquals(2, result.getMonitorCount());
                assertEquals(1, result.getSmallApplianceBoxCount());
                assertEquals("おまかせ消去サービスを利用", result.getDataErasureOptionLabel());
                assertEquals("希望する", result.getCardboardDeliveryLabel());
                assertEquals("管理担当よりご連絡予定です。", result.getCustomerNote());
        }

        @Test
        void lookupOrder_throwsWhenNoMatchingOrderExists() {
                when(recycleOrderRepository.findByIdAndEmailIgnoreCase(1L, "missing@example.com"))
                                .thenReturn(Optional.empty());

                assertThrows(
                                ResourceNotFoundException.class,
                                () -> orderService.lookupOrder(1L, "missing@example.com"));

                verify(orderNotificationService, never()).sendOrderStatusUpdated(any(), any(), any());
        }

        private static RecycleOrder buildOrder() {
                Contact contact = Contact.builder()
                                .id(10L)
                                .email("test@example.com")
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
                                .contact(contact)
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
                                .customerNote("管理担当よりご連絡予定です。")
                                .internalNote("内部確認メモです。")
                                .createdAt(Instant.parse("2026-04-15T00:30:00Z"))
                                .updatedAt(Instant.parse("2026-04-15T00:30:00Z"))
                                .build();
        }
}