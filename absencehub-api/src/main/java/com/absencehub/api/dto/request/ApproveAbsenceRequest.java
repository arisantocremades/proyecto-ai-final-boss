package com.absencehub.api.dto.request;

import jakarta.validation.constraints.Size;

public record ApproveAbsenceRequest(
        @Size(max = 500)
        String managerComment   // opcional al aprobar
) {}
