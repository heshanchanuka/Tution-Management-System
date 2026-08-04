package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepo extends JpaRepository<Student, Long> {

    Page<Student> findByFullNameContainingIgnoreCase(String search, Pageable pageable);

    List<Student> findByParent_Id(Long parentId);

    boolean existsByParent_Id(Long parentId);
}
