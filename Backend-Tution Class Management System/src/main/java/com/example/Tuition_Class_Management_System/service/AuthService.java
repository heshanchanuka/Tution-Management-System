package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.LoginRequest;
import com.example.Tuition_Class_Management_System.dto.LoginResponse;
import com.example.Tuition_Class_Management_System.dto.UserResponse;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.Role;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.security.JwtUtil;
import com.example.Tuition_Class_Management_System.security.UserDetailsServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private ModelMapper modelMapper;

    public LoginResponse login(LoginRequest request) {
        // Throws BadCredentialsException on failure -> mapped to a clean 401 by GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        AppUser user = appUserRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("User vanished after successful authentication"));

        return new LoginResponse(token, toUserResponse(user));
    }

    private UserResponse toUserResponse(AppUser user) {
        UserResponse response = modelMapper.map(user, UserResponse.class);
        response.setRoles(user.getRoles().stream().map(Role::getName).toList());
        return response;
    }
}
