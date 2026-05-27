package com.absencehub.api.exception;

public class BusinessException extends AppException {

    public BusinessException(String code, String message) {
        super(code, message);
    }
}
