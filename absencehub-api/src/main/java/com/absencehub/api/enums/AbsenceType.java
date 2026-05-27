package com.absencehub.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

// Valores JSON en minúsculas: 'sick' no 'sick_leave' (fuente de verdad: AbsenceType.Sick = 'sick' en Angular)
public enum AbsenceType {
    VACATION("vacation"),
    SICK("sick"),
    PERSONAL("personal"),
    OTHER("other");

    private final String value;

    AbsenceType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static AbsenceType fromValue(String value) {
        for (AbsenceType type : values()) {
            if (type.value.equalsIgnoreCase(value)) return type;
        }
        throw new IllegalArgumentException("Unknown absence type: " + value);
    }
}
