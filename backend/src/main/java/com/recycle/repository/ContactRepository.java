package com.recycle.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.recycle.entity.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    Optional<Contact> findByEmail(String email);
}