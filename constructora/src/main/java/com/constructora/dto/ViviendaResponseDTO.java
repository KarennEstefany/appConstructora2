package com.constructora.dto;

import java.math.BigDecimal;

import com.constructora.enums.TipoVivienda;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;


@Getter 
@Setter
public class ViviendaResponseDTO {
    private Long id;
    
    private String titulo;

    private TipoVivienda tipo;

    private Integer habitaciones; 

    private Integer banos;

    private Double area;

    private BigDecimal precio;

    private String imagenUrl;
    @JsonProperty("disponible")
    private Boolean disponible;

    private Long proyectoId;
    private String proyectoNombre;
    // Getters y Setters obligatorios
    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }
}
