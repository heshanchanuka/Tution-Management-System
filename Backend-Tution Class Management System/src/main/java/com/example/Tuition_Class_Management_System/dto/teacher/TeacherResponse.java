package com.example.Tuition_Class_Management_System.dto.teacher;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class TeacherResponse {

    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String qualifications;
    private String subjectSpecialty;
    private LocalDate joinedDate;
}
