package com.example.Tuition_Class_Management_System.dto.student;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class StudentResponse {

    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gradeLevel;
    private Long parentId;
    private String parentName;
}
