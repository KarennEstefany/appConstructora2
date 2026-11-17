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

import com.constructora.dto.ClienteInteresadoResponseDTO;
import com.constructora.dto.ProyectoRequestDTO;
import com.constructora.dto.ProyectoResponseDTO;
import com.constructora.dto.ViviendaResponseDTO;
import com.constructora.enums.EstadoProyecto;
import com.constructora.enums.TipoVivienda;
import com.constructora.services.ClienteInteresadoService;
import com.constructora.services.ProyectoService;
import com.constructora.services.ViviendaService;

import jakarta.validation.Valid;

@RestController 
@RequestMapping ("/api/proyectos")
public class ProyectoController {
    private final ProyectoService proyectoService;
    private final ViviendaService viviendaService;
    private final ClienteInteresadoService clienteInteresadoService;
    public ProyectoController(ProyectoService proyectoService, ViviendaService viviendaService,
            ClienteInteresadoService clienteInteresadoService) {
        this.proyectoService = proyectoService;
        this.viviendaService = viviendaService;
        this.clienteInteresadoService = clienteInteresadoService;
    }

    // @GetMapping 
    // public ResponseEntity<List<ProyectoResponseDTO>> obtenerTodos(){
    //     return ResponseEntity.ok(proyectoService.obtenerTodos());
    // }
    @GetMapping
    public ResponseEntity<List<ProyectoResponseDTO>> obtenerTodos(
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) EstadoProyecto estado,
            @RequestParam(required = false) TipoVivienda tipo,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax) {
        return ResponseEntity.ok(proyectoService.filtrar(ciudad, estado, tipo, precioMin, precioMax));
    }

    @GetMapping("/filtros")
    public ResponseEntity<Map<String, Object>> obtenerFiltros() {
        return ResponseEntity.ok(proyectoService.obtenerOpcionesFiltros());
    }

    @GetMapping ("/destacados")
    public ResponseEntity<List<ProyectoResponseDTO>> obtenerDestacados(){
        return ResponseEntity.ok(proyectoService.obtenerDestacados());
    }

    @GetMapping ("/{id}")
    public ResponseEntity<ProyectoResponseDTO> obtenerPorId(@PathVariable Long id){
        return ResponseEntity.ok(proyectoService.obtenerPorId(id));
    }

    @GetMapping("/{proyectoId}/viviendas") // <--- Ruta anidada correcta
    public ResponseEntity<List<ViviendaResponseDTO>> obtenerViviendas(@PathVariable Long proyectoId) {
        return ResponseEntity.ok(viviendaService.obtenerPorProyecto(proyectoId));
    }
    @GetMapping ("/{proyectoId}/clientes")
    public ResponseEntity<List<ClienteInteresadoResponseDTO>> obtenerClientes(@PathVariable Long proyectoId){
        return ResponseEntity.ok(clienteInteresadoService.obtenerPorProyecto(proyectoId));

    }

    @PostMapping 
    public ResponseEntity<ProyectoResponseDTO> crear(@Valid @RequestBody ProyectoRequestDTO dto){
        ProyectoResponseDTO creado = proyectoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProyectoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody ProyectoRequestDTO dto){

    
        return ResponseEntity.ok(proyectoService.actualizar(id,dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ProyectoResponseDTO> eliminar(@PathVariable Long id){
        proyectoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    

    
    
    
    
}
