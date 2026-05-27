package com.absencehub.api.service.impl;

import com.absencehub.api.dto.request.CreateUserRequest;
import com.absencehub.api.dto.request.RoleUpdateRequest;
import com.absencehub.api.dto.request.UpdateUserRequest;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;
import com.absencehub.api.entity.User;
import com.absencehub.api.exception.BusinessException;
import com.absencehub.api.exception.ResourceNotFoundException;
import com.absencehub.api.mapper.UserMapper;
import com.absencehub.api.repository.UserRepository;
import com.absencehub.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse findMe(Long userId) {
        return userMapper.toResponse(loadUser(userId));
    }

    @Override
    public UserResponse updateMe(Long userId, UpdateUserRequest request) {
        User user = loadUser(userId);
        user.setName(request.name());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> search(String query) {
        if (query == null || query.trim().length() < 2) return List.of();
        return userRepository
                .findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(query, query)
                .stream()
                .map(userMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userMapper.toResponseList(userRepository.findAll());
    }

    @Override
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("EMAIL_TAKEN", "El email ya está en uso: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .role(request.role())
                .availableDays(22)
                .active(true)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long userId, UpdateUserRequest request) {
        User user = loadUser(userId);
        user.setName(request.name());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateRole(Long userId, RoleUpdateRequest request) {
        User user = loadUser(userId);
        user.setRole(request.role());
        return userMapper.toResponse(userRepository.save(user));
    }

    private User loadUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
