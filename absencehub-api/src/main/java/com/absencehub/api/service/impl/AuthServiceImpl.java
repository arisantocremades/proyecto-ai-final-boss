package com.absencehub.api.service.impl;

import com.absencehub.api.dto.request.LoginRequest;
import com.absencehub.api.dto.response.AuthResponse;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.exception.ResourceNotFoundException;
import com.absencehub.api.mapper.UserMapper;
import com.absencehub.api.repository.UserRepository;
import com.absencehub.api.security.UserDetailsImpl;
import com.absencehub.api.security.JwtUtil;
import com.absencehub.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        var user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", userDetails.getId()));

        return new AuthResponse(token, "Bearer", userMapper.toResponse(user));
    }

    @Override
    public UserResponse me(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return userMapper.toResponse(user);
    }
}
