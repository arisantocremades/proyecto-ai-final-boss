package com.absencehub.api.dto.response;

// Shape { code, message } que el HttpInterceptor Angular espera en errores
public record ErrorResponse(String code, String message) {}
