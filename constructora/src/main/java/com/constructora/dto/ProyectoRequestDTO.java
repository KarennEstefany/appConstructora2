package com.constructora.dto;

import java.math.BigDecimal;

import com.constructora.enums.EstadoProyecto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Setter 
@Getter 
public class ProyectoRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    private String direccion;

    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value ="0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precioDesde;

    private String imagenUrl;
    private String mapaUrl;
    @NotNull(message = "El estado del proyecto es obligatorio")
    private EstadoProyecto estado;

    private Boolean destacado;


}
