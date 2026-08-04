package com.example.Tuition_Class_Management_System.dto.parent;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParentUpdateRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String address;
    private String occupation;
}
