package com.example.Tuition_Class_Management_System.dto.exam;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExamCreateRequest {

    @NotNull(message = "Class is required")
    private Long classId;

    @NotBlank(message = "Exam name is required")
    private String name;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Max marks is required")
    @Positive(message = "Max marks must be positive")
    private BigDecimal maxMarks;
}
