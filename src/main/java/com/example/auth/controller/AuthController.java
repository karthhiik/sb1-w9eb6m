package com.example.auth.controller;

import com.example.auth.model.User;
import com.example.auth.security.JwtUtil;
import com.example.auth.service.AuthService;
import com.example.auth.service.SessionManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final SessionManager sessionManager;

    public AuthController(AuthenticationManager authenticationManager,
                         AuthService authService,
                         JwtUtil jwtUtil,
                         SessionManager sessionManager) {
        this.authenticationManager = authenticationManager;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.sessionManager = sessionManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = authService.registerUser(user);
            return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "email", registeredUser.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.get("email"),
                    loginRequest.get("password")
                )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Invalid credentials"
            ));
        }

        final UserDetails userDetails = authService.loadUserByUsername(loginRequest.get("email"));
        final String jwt = jwtUtil.generateToken(userDetails);
        
        sessionManager.addToken(loginRequest.get("email"), jwt);

        return ResponseEntity.ok(Map.of(
            "token", jwt
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        String email = jwtUtil.extractUsername(jwt);
        sessionManager.removeToken(email);
        
        return ResponseEntity.ok(Map.of(
            "message", "Logged out successfully"
        ));
    }
}