package com.example.Tuition_Class_Management_System.dto.parent;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ParentResponse {

    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String address;
    private String occupation;
}
