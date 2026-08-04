package com.example.Tuition_Class_Management_System.dto.exam;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One student's results across every exam - the shape a parent's "results"
 * view and the report-card PDF both need. Distinct from ExamResultResponse,
 * which is the opposite view: one exam across every student in the class.
 */
@Data
@NoArgsConstructor
public class StudentResultResponse {

    private Long examId;
    private String examName;
    private String subject;
    private LocalDate examDate;
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
    private String grade;
    private String remarks;
}
