package com.absencehub.api.dto.response;

import java.util.List;

public record TeamResponse(
        Long id,
        String name,
        String description,
        UserSummaryResponse manager,
        List<UserSummaryResponse> members
) {}
