package com.absencehub.api.dto.request;

import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
        @NotNull
        Long userId
) {}
