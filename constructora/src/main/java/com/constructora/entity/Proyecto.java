package com.constructora.entity;

import java.math.BigDecimal;

import com.constructora.enums.EstadoProyecto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity // Indica que la clase es una entidad JPA (tabla en la BD)
@Table (name="proyectos") //Nombre en la tabla en MySQL
@Getter // Generacion automatica de los getters con lombok
@Setter  // Generacion automatica de los getters con lombok
@NoArgsConstructor //Constructor vacio 
@AllArgsConstructor // Constructor con todos los campos

public class Proyecto{
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

     @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

     @Column(nullable = false)
    private String ciudad;

    private String direccion;

     @Column(nullable = false)
    private BigDecimal precioDesde;

    private String imagenUrl;
    @Column(name = "mapa_url", length = 500)
    private String mapaUrl; // <--- Nuevo campo para el enlace de Google Maps
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoProyecto estado;
    @Column(nullable = false)
    private Boolean destacado;


    

}