package com.example.marinin.front.model;

public class LoginResponse {
    private String token;
    private String accessType;

    public LoginResponse() {
    }

    public LoginResponse(String token, String accessType) {
        this.token = token;
        this.accessType = accessType;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getAccessType() {
        return accessType;
    }

    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }
}
