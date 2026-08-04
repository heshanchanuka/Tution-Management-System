package com.example.Tuition_Class_Management_System.repo;

import com.example.Tuition_Class_Management_System.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepo extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByExam_Id(Long examId);

    List<ExamResult> findByStudent_Id(Long studentId);

    Optional<ExamResult> findByExam_IdAndStudent_Id(Long examId, Long studentId);
}
