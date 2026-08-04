package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementCreateRequest;
import com.example.Tuition_Class_Management_System.dto.announcement.AnnouncementResponse;
import com.example.Tuition_Class_Management_System.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/announcements")
@PreAuthorize("hasRole('ADMIN')")
public class AnnouncementController {

    @Autowired
    private AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<AnnouncementResponse> create(@Valid @RequestBody AnnouncementCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.create(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<AnnouncementResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(announcementService.listAll(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
