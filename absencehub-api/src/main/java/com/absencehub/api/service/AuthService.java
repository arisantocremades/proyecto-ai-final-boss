package com.absencehub.api.service;

import com.absencehub.api.dto.request.LoginRequest;
import com.absencehub.api.dto.response.AuthResponse;
import com.absencehub.api.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    UserResponse me(Long userId);
}
