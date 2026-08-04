package com.example.Tuition_Class_Management_System.dto.teacher;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TeacherCreateRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String qualifications;
    private String subjectSpecialty;
}
