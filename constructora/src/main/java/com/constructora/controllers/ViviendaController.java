package com.constructora.controllers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import com.constructora.dto.ViviendaRequestDTO;
import com.constructora.dto.ViviendaResponseDTO;
import com.constructora.enums.TipoVivienda;
import com.constructora.services.ViviendaService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping("/api/viviendas")
public class ViviendaController {
    private final ViviendaService viviendaService;

    public ViviendaController(ViviendaService viviendaService) {
        this.viviendaService = viviendaService;
    }

    // @GetMapping
    public ResponseEntity<List<ViviendaResponseDTO>>obtenerTodas(){
        return ResponseEntity.ok(viviendaService.obtenerTodas());
    }

    @GetMapping
public ResponseEntity<List<ViviendaResponseDTO>> obtenerTodas(
        @RequestParam(required = false) String ciudad,
        @RequestParam(required = false) Long proyectoId,
        @RequestParam(required = false) TipoVivienda tipo,
        @RequestParam(required = false) Integer habitaciones,
        @RequestParam(required = false) BigDecimal precioMin,
        @RequestParam(required = false) BigDecimal precioMax) {
    return ResponseEntity.ok(viviendaService.filtrar(ciudad, proyectoId, tipo, habitaciones, precioMin, precioMax));
}

@GetMapping("/filtros")
public ResponseEntity<Map<String, Object>> obtenerFiltros() {
    return ResponseEntity.ok(viviendaService.obtenerOpcionesFiltros());
}
    
    @GetMapping ("/disponibles")
    public ResponseEntity<List<ViviendaResponseDTO>>obtenerDisponibles(){
        return ResponseEntity.ok(viviendaService.obtenerDisponibles());
    }
    @GetMapping ("/{id}")
    public ResponseEntity<ViviendaResponseDTO>obtenerPorId(@PathVariable Long id){
        return ResponseEntity.ok(viviendaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ViviendaResponseDTO>crear(@Valid @RequestBody ViviendaRequestDTO dto){
        ViviendaResponseDTO creado = viviendaService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ViviendaResponseDTO>actualizar(@PathVariable Long id, @Valid @RequestBody ViviendaRequestDTO dto){
        
        return ResponseEntity.ok(viviendaService.actualizar(id,dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ViviendaResponseDTO>eliminar(@PathVariable Long id){
        viviendaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
