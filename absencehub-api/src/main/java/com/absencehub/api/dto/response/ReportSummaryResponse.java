package com.absencehub.api.dto.response;

public record ReportSummaryResponse(
        long totalAbsences,
        long pendingCount,
        long approvedCount,
        long rejectedCount,
        long totalDaysApproved
) {}
