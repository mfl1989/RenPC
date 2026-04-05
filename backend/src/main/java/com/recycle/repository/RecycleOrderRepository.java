package com.recycle.repository;

import com.recycle.entity.RecycleOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecycleOrderRepository extends JpaRepository<RecycleOrder, Long> {}
