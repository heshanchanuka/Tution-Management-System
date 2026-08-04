package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamRepo extends JpaRepository<Exam, Long> {

    List<Exam> findBySchoolClass_Id(Long classId);
}
