package com.absencehub.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTeamRequest(
        @NotBlank
        String name,

        @Size(max = 500)
        String description,

        @NotNull
        Long managerId
) {}
