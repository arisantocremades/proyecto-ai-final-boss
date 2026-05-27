package com.absencehub.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

// Valores JSON en minúsculas para coincidir con RequestStatus del frontend Angular
public enum AbsenceStatus {
    PENDING("pending"),
    APPROVED("approved"),
    REJECTED("rejected");

    private final String value;

    AbsenceStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AbsenceStatus fromValue(String value) {
        for (AbsenceStatus status : values()) {
            if (status.value.equalsIgnoreCase(value)) return status;
        }
        throw new IllegalArgumentException("Unknown absence status: " + value);
    }
}
