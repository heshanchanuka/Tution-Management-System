package com.example.Tuition_Class_Management_System.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public String getUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
