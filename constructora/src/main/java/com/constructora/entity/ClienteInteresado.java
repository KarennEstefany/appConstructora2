package com.constructora.entity;


import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity // Indica que la clase es una entidad JPA (tabla en la BD)
@Table (name="clientes_interesados") //Nombre en la tabla en MySQL
@Getter // Generacion automatica de los getters con lombok
@Setter  // Generacion automatica de los getters con lombok
@NoArgsConstructor //Constructor vacio 
@AllArgsConstructor // Constructor con todos los campos

public class ClienteInteresado{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private String correo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "proyecto_id", nullable = false)
    
    private Proyecto proyecto;


}