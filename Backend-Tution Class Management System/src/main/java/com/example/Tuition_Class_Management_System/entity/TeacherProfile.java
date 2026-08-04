package com.example.Tuition_Class_Management_System.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "teacher_profile")
@Data
public class TeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser appUser;

    private String qualifications;

    private String subjectSpecialty;

    @Column(nullable = false, updatable = false)
    private LocalDate joinedDate = LocalDate.now();
}
