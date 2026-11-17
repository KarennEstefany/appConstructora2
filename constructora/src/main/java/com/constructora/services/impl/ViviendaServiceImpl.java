package com.constructora.services.impl;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.constructora.dto.ViviendaRequestDTO;
import com.constructora.dto.ViviendaResponseDTO;
import com.constructora.entity.Proyecto;
import com.constructora.entity.Vivienda;
import com.constructora.enums.TipoVivienda;
import com.constructora.exception.ResourceNotFoundException;
import com.constructora.mapper.ViviendaMapper;
import com.constructora.repository.ProyectoRepository;
import com.constructora.repository.ViviendaRepository;
import com.constructora.services.ViviendaService;

@Service
public class ViviendaServiceImpl implements ViviendaService {

    private final ViviendaRepository viviendaRepository;
    private final ProyectoRepository proyectoRepository;
    private final ViviendaMapper viviendaMapper;

    public ViviendaServiceImpl(ViviendaRepository viviendaRepository,
                            ProyectoRepository proyectoRepository,
                            ViviendaMapper viviendaMapper) {
        this.viviendaRepository = viviendaRepository;
        this.proyectoRepository = proyectoRepository;
        this.viviendaMapper = viviendaMapper;
    }

    @Override
    public List<ViviendaResponseDTO> obtenerTodas() {
        return viviendaRepository.findAll().stream()
                .map(viviendaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ViviendaResponseDTO> obtenerDisponibles() {
        return viviendaRepository.findByDisponibleTrue().stream()
                .map(viviendaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ViviendaResponseDTO> obtenerPorProyecto(Long proyectoId) {
        verificarProyecto(proyectoId);
        return viviendaRepository.findByProyectoId(proyectoId).stream()
                .map(viviendaMapper::toResponseDTO)
                .toList();
    }

    @Override
    public ViviendaResponseDTO obtenerPorId(Long id) {
        Vivienda vivienda = viviendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la vivienda con id: " + id));
        return viviendaMapper.toResponseDTO(vivienda);
    }

    @Override
    public ViviendaResponseDTO crear(ViviendaRequestDTO dto) {
        Proyecto proyecto = verificarProyecto(dto.getProyectoId());
        Vivienda vivienda = viviendaMapper.toEntity(dto, proyecto);
        Vivienda guardada = viviendaRepository.save(vivienda);
        return viviendaMapper.toResponseDTO(guardada);
    }

    @Override
    public ViviendaResponseDTO actualizar(Long id, ViviendaRequestDTO dto) {
        Vivienda vivienda = viviendaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la vivienda con id: " + id));
        
        Proyecto proyecto = verificarProyecto(dto.getProyectoId());
        viviendaMapper.updateEntity(vivienda, dto, proyecto);
        
        Vivienda actualizada = viviendaRepository.save(vivienda);
        return viviendaMapper.toResponseDTO(actualizada);
    }

    @Override
    public void eliminar(Long id) {
        if (!viviendaRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se encontró la vivienda con id: " + id);
        }
        viviendaRepository.deleteById(id);
    }

    // Método auxiliar privado para validar la existencia del proyecto asociado
    private Proyecto verificarProyecto(Long proyectoId) {
        return proyectoRepository.findById(proyectoId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el proyecto con id: " + proyectoId));
    }
    @Override
public List<ViviendaResponseDTO> filtrar(String ciudad, Long proyectoId, TipoVivienda tipo,
                                        Integer habitaciones, BigDecimal precioMin, BigDecimal precioMax) {
    String ciudadLimpia = (ciudad == null || ciudad.isBlank()) ? null : ciudad.trim();

    if (precioMin != null && precioMax != null && precioMin.compareTo(precioMax) > 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "El precio mínimo no puede ser mayor al precio máximo");
    }
    if (ciudadLimpia == null && proyectoId == null && tipo == null && habitaciones == null
            && precioMin == null && precioMax == null) {
        return obtenerTodas(); // comportamiento actual intacto
    }
    return viviendaRepository.filtrar(ciudadLimpia, proyectoId, tipo, habitaciones, precioMin, precioMax)
            .stream().map(viviendaMapper::toResponseDTO).toList();
}

@Override
public Map<String, Object> obtenerOpcionesFiltros() {
    List<Map<String, Object>> proyectos = viviendaRepository.findProyectosConVivienda().stream()
            .map(fila -> {
                Map<String, Object> p = new LinkedHashMap<>();
                p.put("id", fila[0]);
                p.put("nombre", fila[1]);
                return p;
            }).toList();

    Map<String, Object> opciones = new LinkedHashMap<>();
    opciones.put("ciudades", viviendaRepository.findCiudadesConVivienda());
    opciones.put("proyectos", proyectos);
    opciones.put("tipos", viviendaRepository.findTipos());
    opciones.put("habitaciones", viviendaRepository.findHabitaciones());
    opciones.put("precioMin", viviendaRepository.findPrecioMinimo()); // null si no hay viviendas
    opciones.put("precioMax", viviendaRepository.findPrecioMaximo());
    return opciones;
}
}