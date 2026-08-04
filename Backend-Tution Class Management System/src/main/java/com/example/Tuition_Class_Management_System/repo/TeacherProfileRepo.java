package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.TeacherProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherProfileRepo extends JpaRepository<TeacherProfile, Long> {

    Page<TeacherProfile> findByAppUser_FullNameContainingIgnoreCase(String search, Pageable pageable);

    Optional<TeacherProfile> findByAppUser_Username(String username);
}
