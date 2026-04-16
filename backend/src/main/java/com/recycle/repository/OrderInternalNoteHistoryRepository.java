package com.recycle.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.recycle.entity.OrderInternalNoteHistory;

@Repository
public interface OrderInternalNoteHistoryRepository extends JpaRepository<OrderInternalNoteHistory, Long> {

    List<OrderInternalNoteHistory> findByRecycleOrderIdOrderByChangedAtDesc(Long recycleOrderId);
}