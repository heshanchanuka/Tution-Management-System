package com.example.Tuition_Class_Management_System.dto.exam;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class ExamResultResponse {

    private Long id;
    private Long examId;
    private Long studentId;
    private String studentName;
    private BigDecimal marksObtained;
    private BigDecimal maxMarks;
    private String grade;
    private String remarks;
}
