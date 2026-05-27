package com.absencehub.api.exception;

public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String resource, Object id) {
        super("NOT_FOUND", resource + " not found with id: " + id);
    }
}
