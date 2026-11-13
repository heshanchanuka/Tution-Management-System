package com.example.Tuition_Class_Management_System.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Public self-registration. Only parents can sign up this way - the role is
 * never taken from the client, and the account starts disabled until an
 * admin approves it.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9._]+$", message = "Username may only contain letters, numbers, '.' and '_'")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Password must contain at least one letter and one number")
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @Pattern(regexp = "^$|^[0-9+\\- ]{7,20}$", message = "Phone number must be 7-20 digits")
    private String phone;

    @Size(max = 255, message = "Address must be at most 255 characters")
    private String address;

    @Size(max = 100, message = "Occupation must be at most 100 characters")
    private String occupation;

    /** Reported under the "passwordMatching" key in fieldErrors. */
    @AssertTrue(message = "Passwords do not match")
    public boolean isPasswordMatching() {
        return password == null || password.equals(confirmPassword);
    }
}
