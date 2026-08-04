package com.example.Tuition_Class_Management_System.service;

import com.example.Tuition_Class_Management_System.entity.AppUser;
import com.example.Tuition_Class_Management_System.entity.Role;
import com.example.Tuition_Class_Management_System.repo.AppUserRepo;
import com.example.Tuition_Class_Management_System.repo.RoleRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Runs once at startup. Idempotent - safe to run against a database that
 * already has this data. Seeds the three fixed roles and one default admin
 * account so there's always a way to log in on a fresh database.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private AppUserRepo appUserRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role admin = ensureRole("ADMIN", "Institute administrator");
        ensureRole("TEACHER", "Teacher assigned to one or more classes");
        ensureRole("PARENT", "Parent/guardian of one or more enrolled students");

        if (!appUserRepo.existsByUsername("admin")) {
            AppUser adminUser = new AppUser();
            adminUser.setUsername("admin");
            adminUser.setPassword(passwordEncoder.encode("Admin@123"));
            adminUser.setFullName("Institute Administrator");
            adminUser.setEnabled(true);
            adminUser.setRoles(Set.of(admin));
            appUserRepo.save(adminUser);
        }
    }

    private Role ensureRole(String name, String description) {
        return roleRepo.findById(name).orElseGet(() -> roleRepo.save(new Role(name, description)));
    }
}
