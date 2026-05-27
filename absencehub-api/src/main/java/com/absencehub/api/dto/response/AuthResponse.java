package com.absencehub.api.dto.response;

// Shape guardada en localStorage['absencehub_session'] por Angular
public record AuthResponse(
        String token,
        String tokenType,   // siempre "Bearer"
        UserResponse user
) {}
