package com.absencehub.api.service;

import com.absencehub.api.dto.request.CreateUserRequest;
import com.absencehub.api.dto.request.RoleUpdateRequest;
import com.absencehub.api.dto.request.UpdateUserRequest;
import com.absencehub.api.dto.response.UserResponse;
import com.absencehub.api.dto.response.UserSummaryResponse;

import java.util.List;

public interface UserService {

    UserResponse findMe(Long userId);

    UserResponse updateMe(Long userId, UpdateUserRequest request);

    List<UserSummaryResponse> search(String query);

    List<UserResponse> findAll();

    UserResponse create(CreateUserRequest request);

    UserResponse update(Long userId, UpdateUserRequest request);

    UserResponse updateRole(Long userId, RoleUpdateRequest request);
}
