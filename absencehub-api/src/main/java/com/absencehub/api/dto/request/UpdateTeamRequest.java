package com.absencehub.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTeamRequest(
        @NotBlank
        String name,

        @Size(max = 500)
        String description
) {}
