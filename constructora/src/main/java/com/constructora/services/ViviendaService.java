package com.constructora.services;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.constructora.dto.ViviendaRequestDTO;
import com.constructora.dto.ViviendaResponseDTO;
import com.constructora.enums.TipoVivienda;

public interface ViviendaService {

    
    List<ViviendaResponseDTO> obtenerTodas();
    List<ViviendaResponseDTO> obtenerDisponibles();

    List<ViviendaResponseDTO> obtenerPorProyecto(Long proyectoId);

    ViviendaResponseDTO obtenerPorId(Long id);

    ViviendaResponseDTO crear(ViviendaRequestDTO dto);

    ViviendaResponseDTO actualizar(Long id, ViviendaRequestDTO dto);

    void eliminar(Long id);

    List<ViviendaResponseDTO> filtrar(String ciudad, Long proyectoId, TipoVivienda tipo,
                                Integer habitaciones, BigDecimal precioMin, BigDecimal precioMax);
Map<String, Object> obtenerOpcionesFiltros();


    
}
