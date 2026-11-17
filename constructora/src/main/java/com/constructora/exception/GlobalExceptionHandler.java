package com.constructora.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<Map<String,Object>> handleNotFound
        ( ResourceNotFoundException ex, HttpServletRequest request) {
            Map<String,Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", HttpStatus.NOT_FOUND.value());
            body.put("error",  "Recurso no encontrado");
            body.put("message", ex.getMessage());
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
            }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String,Object>> handleValidation
        ( MethodArgumentNotValidException ex) {
            Map<String,Object> body = new HashMap<>();
            Map<String,String> errors = new HashMap<>();
            for(FieldError error : ex.getBindingResult().getFieldErrors()){
                errors.put(error.getField(), error.getDefaultMessage());
            }

            body.put("status", HttpStatus.BAD_REQUEST.value());
            body.put("error",  errors);
            body.put("message", "Existen errores de validacion");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
            }
        
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String,Object>> handleValidation
        ( Exception ex, HttpServletRequest request) {
            Map<String,Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            body.put("error",  "Error");
            body.put("message", "Existen errores de validacion");
            body.put("path", request.getRequestURI());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
            }
        
        
        
    


}


