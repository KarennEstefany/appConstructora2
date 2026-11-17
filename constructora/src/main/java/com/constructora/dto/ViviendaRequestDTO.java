package com.constructora.dto;

import java.math.BigDecimal;

import com.constructora.enums.TipoVivienda;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
@Getter 
@Setter 
public class ViviendaRequestDTO {

    @NotBlank(message = "El titulo no puede estar vacío")
    private String titulo;

    @NotNull(message= "El tipo de vivienda es obligatorio")
    private TipoVivienda tipo;

    @NotNull (message ="Las habitaciones son obligatorias")
    @Min (value =0, message = "Minimo 0 habitaciones")
    private Integer habitaciones; 

    @NotNull (message ="Los banos son obligatorios")
    @Min (value =1, message = "Al menos 1 bano")
    private Integer banos;

    @NotNull ( message ="El area es obligatoria")
    @DecimalMin (value = "0.01", message ="El area debe ser mayor a 0")
    private Double area;

    
    @NotNull ( message ="El precio es obligatorio")
    @DecimalMin (value = "0.01", message ="El precio debe ser mayor a 0")
    private BigDecimal precio;

    private String imagenUrl;
    @JsonProperty("disponible")
    private Boolean disponible;

    @NotNull (message ="El proyecto al que pertenece es obligatorio")
    private Long proyectoId;
}
