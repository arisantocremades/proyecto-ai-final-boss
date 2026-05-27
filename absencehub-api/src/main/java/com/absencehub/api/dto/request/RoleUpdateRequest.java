package com.absencehub.api.dto.request;

import com.absencehub.api.enums.Role;
import jakarta.validation.constraints.NotNull;

public record RoleUpdateRequest(
        @NotNull
        Role role
) {}
