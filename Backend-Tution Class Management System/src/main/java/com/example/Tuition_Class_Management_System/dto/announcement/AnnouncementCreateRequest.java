package com.example.Tuition_Class_Management_System.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnnouncementCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    /** Null = broadcast to every parent; set = only that class's parents. */
    private Long targetClassId;

    private LocalDateTime expiresAt;
}
