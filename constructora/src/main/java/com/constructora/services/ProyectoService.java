package com.constructora.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.constructora.dto.ProyectoRequestDTO;
import com.constructora.dto.ProyectoResponseDTO;
import com.constructora.enums.EstadoProyecto;
import com.constructora.enums.TipoVivienda;

public interface ProyectoService {

    

    List<ProyectoResponseDTO> obtenerTodos();
    
    List<ProyectoResponseDTO> obtenerDestacados();


    ProyectoResponseDTO obtenerPorId(Long id);

    ProyectoResponseDTO crear(ProyectoRequestDTO dto);

    ProyectoResponseDTO actualizar(Long id, ProyectoRequestDTO dto);

    void eliminar(Long id);

    // Nuevos
    List<ProyectoResponseDTO> filtrar(String ciudad, EstadoProyecto estado, TipoVivienda tipo,
                                    BigDecimal precioMin, BigDecimal precioMax);
    Map<String, Object> obtenerOpcionesFiltros();

}