package com.example.Tuition_Class_Management_System.dto.exam;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ExamResponse {

    private Long id;
    private String name;
    private Long classId;
    private String subject;
    private LocalDate examDate;
    private BigDecimal maxMarks;
}
