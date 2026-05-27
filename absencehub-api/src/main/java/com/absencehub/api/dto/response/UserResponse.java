package com.absencehub.api.dto.response;

import com.absencehub.api.enums.Role;

// Shape que espera AuthService.currentUser en Angular
public record UserResponse(
        Long id,
        String email,
        String name,
        Role role,
        Integer availableDays,
        TeamSummaryResponse team   // nullable — Admin sin equipo es estado válido
) {}
