package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.SchoolClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolClassRepo extends JpaRepository<SchoolClass, Long> {

    Page<SchoolClass> findBySubjectContainingIgnoreCase(String search, Pageable pageable);

    boolean existsByTeacher_Id(Long teacherId);

    List<SchoolClass> findByStudents_Id(Long studentId);
}
