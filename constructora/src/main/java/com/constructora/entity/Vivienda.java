package com.constructora.entity;

import java.math.BigDecimal;

import com.constructora.enums.TipoVivienda;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity //Indica que esta clase es una entidad de JPA
@Table (name = "viviendas")
@Getter
@Setter 
@NoArgsConstructor 


public class Vivienda {


    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Indica que es autoincrementable 
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoVivienda tipo;

    @Column(nullable = false)
    private Integer habitaciones;

    @Column(nullable = false)
    private Integer banos;

    @Column(nullable = false)
    private Double area;

    @Column(nullable = false)
    private BigDecimal precio;

    private String imagenUrl;

    @JsonProperty("disponible")
    private Boolean disponible = true;
    
    @ManyToOne
    @JoinColumn(name = "proyecto_id", nullable = false)
    private Proyecto proyecto;


}
