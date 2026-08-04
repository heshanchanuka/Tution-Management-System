package com.example.Tuition_Class_Management_System.dto.teacher;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeacherUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String qualifications;
    private String subjectSpecialty;
}
