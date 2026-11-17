package com.constructora.services.impl;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.constructora.dto.ProyectoRequestDTO;
import com.constructora.dto.ProyectoResponseDTO;
import com.constructora.entity.Proyecto;
import com.constructora.enums.EstadoProyecto;
import com.constructora.enums.TipoVivienda;
import com.constructora.exception.ResourceNotFoundException;
import com.constructora.mapper.ProyectoMapper;
import com.constructora.repository.ProyectoRepository;
import com.constructora.services.ProyectoService;

@Service 
public class ProyectoServiceImpl implements ProyectoService {
    private final ProyectoRepository proyectoRepository;
    private final ProyectoMapper proyectoMapper;

    public ProyectoServiceImpl(ProyectoRepository proyectoRepository, ProyectoMapper proyectoMapper) {
        this.proyectoRepository = proyectoRepository;
        this.proyectoMapper = proyectoMapper;
        
    }

    @Override
    public List<ProyectoResponseDTO> obtenerTodos() {
        return proyectoRepository.findAll().stream().map(proyectoMapper::toResponseDTO).toList();
    }
    @Override
    public List<ProyectoResponseDTO> obtenerDestacados() {
        return proyectoRepository.findByDestacadoTrue().stream().map(proyectoMapper::toResponseDTO).toList();
    }
    @Override
    public ProyectoResponseDTO obtenerPorId(Long id) {
        Proyecto proyecto = proyectoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado con id " + id));
        return proyectoMapper.toResponseDTO(proyecto);
    }
    @Override
    public ProyectoResponseDTO crear(ProyectoRequestDTO dto){
        Proyecto proyecto = proyectoMapper.toEntity(dto);
        Proyecto guardado = proyectoRepository.save(proyecto);
        return proyectoMapper.toResponseDTO(guardado);
    }

    @Override
    public ProyectoResponseDTO actualizar(Long id, ProyectoRequestDTO dto) {
        Proyecto proyecto = proyectoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No se encontro el proyecto con id " + id));
        proyectoMapper.updateEntity(proyecto, dto);
        Proyecto actualizado = proyectoRepository.save(proyecto);
        return proyectoMapper.toResponseDTO(actualizado);
    }

    
        @Override 
        public void eliminar(Long id){
            if(!proyectoRepository.existsById(id)){
                throw new ResourceNotFoundException("No se encontro el proyecto con id " + id);
            }
            proyectoRepository.deleteById(id);
        }

    // Implementación
@Override
public List<ProyectoResponseDTO> filtrar(String ciudad, EstadoProyecto estado, TipoVivienda tipo,
                                        BigDecimal precioMin, BigDecimal precioMax) {
    String ciudadLimpia = (ciudad == null || ciudad.isBlank()) ? null : ciudad.trim();

    if (precioMin != null && precioMax != null && precioMin.compareTo(precioMax) > 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "El precio mínimo no puede ser mayor al precio máximo");
    }
    if (ciudadLimpia == null && estado == null && tipo == null && precioMin == null && precioMax == null) {
        return obtenerTodos(); // comportamiento actual intacto
    }
    return proyectoRepository.filtrar(ciudadLimpia, estado, tipo, precioMin, precioMax)
            .stream().map(proyectoMapper::toResponseDTO).toList();
}

@Override
public Map<String, Object> obtenerOpcionesFiltros() {
    Map<String, Object> opciones = new LinkedHashMap<>();
    opciones.put("ciudades", proyectoRepository.findCiudades());
    opciones.put("estados", proyectoRepository.findEstados());
    opciones.put("tipos", proyectoRepository.findTiposVivienda());
    opciones.put("precioMin", proyectoRepository.findPrecioMinimo()); // null si no hay viviendas
    opciones.put("precioMax", proyectoRepository.findPrecioMaximo());
    return opciones;
}
    
}