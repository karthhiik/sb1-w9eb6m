package com.example.auth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private boolean accountLocked;
    private LocalDateTime lockTime;
    private int failedAttempts;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}