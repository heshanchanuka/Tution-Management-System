package com.example.Tuition_Class_Management_System.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * What we send to the client for a user — deliberately excludes the password hash.
 */
@Data
@NoArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private List<String> roles;
}
