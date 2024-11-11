package com.example.auth.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionManager {
    private final Map<String, String> activeTokens = new ConcurrentHashMap<>();

    public void addToken(String email, String token) {
        activeTokens.put(email, token);
    }

    public void removeToken(String email) {
        activeTokens.remove(email);
    }

    public boolean isTokenValid(String email, String token) {
        String storedToken = activeTokens.get(email);
        return storedToken != null && storedToken.equals(token);
    }
}