package com.absencehub.api.dto.response;

import com.absencehub.api.enums.Role;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        Role role
) {}
