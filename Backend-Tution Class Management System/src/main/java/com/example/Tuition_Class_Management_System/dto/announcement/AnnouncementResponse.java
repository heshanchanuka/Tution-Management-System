package com.example.Tuition_Class_Management_System.dto.announcement;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String message;
    private String postedByName;
    private Long targetClassId;
    private String targetClassSubject;
    private LocalDateTime postedAt;
    private LocalDateTime expiresAt;
}
