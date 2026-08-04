package com.example.Tuition_Class_Management_System.dto.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private LocalDate dateOfBirth;

    @NotBlank(message = "Grade level is required")
    private String gradeLevel;

    @NotNull(message = "Parent is required")
    private Long parentId;
}
