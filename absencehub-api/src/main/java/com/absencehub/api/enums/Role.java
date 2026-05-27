package com.absencehub.api.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

// Valores JSON en minúsculas para coincidir con UserRole del frontend Angular
public enum Role {
    EMPLOYEE("employee"),
    MANAGER("manager"),
    ADMIN("admin");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Role fromValue(String value) {
        for (Role role : values()) {
            if (role.value.equalsIgnoreCase(value)) return role;
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}
