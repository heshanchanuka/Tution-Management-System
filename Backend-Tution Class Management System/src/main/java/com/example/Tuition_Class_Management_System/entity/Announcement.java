package com.example.Tuition_Class_Management_System.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private AppUser postedBy;

    /** Null = broadcast to everyone; set = only that class's parents see it. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_class_id")
    private SchoolClass targetClass;

    @Column(nullable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    private LocalDateTime expiresAt;
}
