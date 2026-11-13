package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.dto.LoginRequest;
import com.example.Tuition_Class_Management_System.dto.LoginResponse;
import com.example.Tuition_Class_Management_System.dto.RegisterRequest;
import com.example.Tuition_Class_Management_System.dto.RegisterResponse;
import com.example.Tuition_Class_Management_System.dto.UserResponse;
import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.Role;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.security.JwtUtil;
import com.example.Tuition_Class_Management_System.security.UserDetailsServiceImpl;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private ParentService parentService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public RegisterResponse register(RegisterRequest request) {
        parentService.registerParent(request);
        return new RegisterResponse(request.getUsername(),
                "Registration successful. Your account is pending admin approval.");
    }

    public LoginResponse login(LoginRequest request) {
        // Throws BadCredentialsException on failure -> mapped to a clean 401 by GlobalExceptionHandler.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (DisabledException e) {
            // Spring checks "disabled" before it checks the password, so without this
            // anyone could find out a username is pending just by guessing it.
            // Only reveal the pending status once the password is proven correct.
            boolean passwordMatches = appUserRepo.findByUsername(request.getUsername())
                    .map(u -> passwordEncoder.matches(request.getPassword(), u.getPassword()))
                    .orElse(false);
            if (!passwordMatches) {
                throw new BadCredentialsException("Bad credentials");
            }
            throw e;
        }

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
