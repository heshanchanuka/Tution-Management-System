package com.example.Tuition_Class_Management_System.controller;

import com.example.Tuition_Class_Management_System.dto.LoginRequest;
import com.example.Tuition_Class_Management_System.dto.LoginResponse;
import com.example.Tuition_Class_Management_System.dto.RegisterRequest;
import com.example.Tuition_Class_Management_System.dto.RegisterResponse;
import com.example.Tuition_Class_Management_System.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Public parent self-registration. The account stays disabled until an admin approves it. */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
