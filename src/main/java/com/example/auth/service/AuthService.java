package com.example.auth.service;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class AuthService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionManager sessionManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, SessionManager sessionManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionManager = sessionManager;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean validateLogin(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.isAccountLocked()) {
            if (user.getLockTime().plusMinutes(15).isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Account is locked. Try again later.");
            }
            user.setAccountLocked(false);
            user.setFailedAttempts(0);
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            handleFailedLogin(user);
            return false;
        }

        user.setFailedAttempts(0);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        return true;
    }

    private void handleFailedLogin(User user) {
        user.setFailedAttempts(user.getFailedAttempts() + 1);
        
        if (user.getFailedAttempts() >= 3) {
            user.setAccountLocked(true);
            user.setLockTime(LocalDateTime.now());
        }
        
        userRepository.save(user);
    }
}