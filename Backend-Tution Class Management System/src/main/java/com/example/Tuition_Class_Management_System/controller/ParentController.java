package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.PageResponse;
import com.example.Tuition_Class_Management_System.dto.parent.ParentCreateRequest;
import com.example.Tuition_Class_Management_System.dto.parent.ParentResponse;
import com.example.Tuition_Class_Management_System.dto.parent.ParentUpdateRequest;
import com.example.Tuition_Class_Management_System.service.ParentService;
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
@RequestMapping("/api/admin/parents")
@PreAuthorize("hasRole('ADMIN')")
public class ParentController {

    @Autowired
    private ParentService parentService;

    @PostMapping
    public ResponseEntity<ParentResponse> create(@Valid @RequestBody ParentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(parentService.createParent(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ParentResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));
        return ResponseEntity.ok(parentService.listParents(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParentResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(parentService.getParent(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParentResponse> update(@PathVariable Long id, @Valid @RequestBody ParentUpdateRequest request) {
        return ResponseEntity.ok(parentService.updateParent(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        parentService.deleteParent(id);
        return ResponseEntity.noContent().build();
    }
}
