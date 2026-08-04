package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassRequest;
import com.example.Tuition_Class_Management_System.dto.schoolclass.ClassResponse;
import com.example.Tuition_Class_Management_System.dto.student.StudentResponse;
import com.example.Tuition_Class_Management_System.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/classes")
@PreAuthorize("hasRole('ADMIN')")
public class ClassController {

    @Autowired
    private ClassService classService;

    @PostMapping
    public ResponseEntity<ClassResponse> create(@Valid @RequestBody ClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(classService.createClass(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ClassResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        return ResponseEntity.ok(classService.listClasses(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getClass(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassResponse> update(@PathVariable Long id, @Valid @RequestBody ClassRequest request) {
        return ResponseEntity.ok(classService.updateClass(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> listEnrolled(@PathVariable Long id) {
        return ResponseEntity.ok(classService.listEnrolledStudents(id));
    }

    @PostMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> enroll(@PathVariable Long id, @PathVariable Long studentId) {
        classService.enrollStudent(id, studentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Void> unenroll(@PathVariable Long id, @PathVariable Long studentId) {
        classService.unenrollStudent(id, studentId);
        return ResponseEntity.noContent().build();
    }
}
