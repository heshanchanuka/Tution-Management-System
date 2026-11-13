package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.ParentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParentProfileRepo extends JpaRepository<ParentProfile, Long> {

    Page<ParentProfile> findByAppUser_FullNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<ParentProfile> findByAppUser_Username(String username);

    /** Self-registered parents still waiting for admin approval. */
    Page<ParentProfile> findByAppUser_EnabledFalse(Pageable pageable);
}
