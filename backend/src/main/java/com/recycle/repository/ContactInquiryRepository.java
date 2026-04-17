package com.recycle.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.recycle.entity.ContactInquiry;

public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, Long> {

    long countByInquiryStatus(String inquiryStatus);

    @Query("""
            SELECT ci
            FROM ContactInquiry ci
            WHERE (:keyword IS NULL OR :keyword = ''
            	OR LOWER(ci.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            	OR LOWER(ci.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
            	OR LOWER(ci.message) LIKE LOWER(CONCAT('%', :keyword, '%'))
            	OR ci.orderReference LIKE CONCAT('%', :keyword, '%'))
              AND (:status IS NULL OR :status = '' OR ci.inquiryStatus = :status)
              AND (:assignedTo IS NULL OR :assignedTo = ''
                OR LOWER(ci.assignedTo) LIKE LOWER(CONCAT('%', :assignedTo, '%')))
            """)
    Page<ContactInquiry> findAllWithKeyword(
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("assignedTo") String assignedTo,
            Pageable pageable);
}