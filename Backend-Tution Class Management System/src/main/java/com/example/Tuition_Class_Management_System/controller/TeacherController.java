package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherCreateRequest;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherResponse;
import com.example.Tuition_Class_Management_System.dto.teacher.TeacherUpdateRequest;
import com.example.Tuition_Class_Management_System.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/teachers")
@PreAuthorize("hasRole('ADMIN')")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @PostMapping
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody TeacherCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teacherService.createTeacher(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<TeacherResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        return ResponseEntity.ok(teacherService.listTeachers(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacher(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long id, @Valid @RequestBody TeacherUpdateRequest request) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
