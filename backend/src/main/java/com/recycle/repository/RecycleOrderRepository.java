package com.recycle.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.recycle.entity.RecycleOrder;

@Repository
public interface RecycleOrderRepository extends JpaRepository<RecycleOrder, Long> {

        java.util.Optional<RecycleOrder> findByIdAndEmailIgnoreCase(Long id, String email);

        @Query("SELECT o FROM RecycleOrder o WHERE "
                        + "(:keyword IS NULL "
                        + "OR CAST(o.id AS string) LIKE CONCAT('%', :keyword, '%') "
                        + "OR o.customerNameKanji LIKE CONCAT('%', :keyword, '%') "
                        + "OR (:phoneKeyword <> '' "
                        + "AND o.phone LIKE CONCAT('%', :phoneKeyword, '%')))")
        Page<RecycleOrder> findAllWithKeyword(
                        @Param("keyword") String keyword,
                        @Param("phoneKeyword") String phoneKeyword,
                        Pageable pageable);
}