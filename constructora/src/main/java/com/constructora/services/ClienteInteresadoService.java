package com.constructora.services;

import java.util.List;

import com.constructora.dto.ClienteInteresadoRequestDTO;
import com.constructora.dto.ClienteInteresadoResponseDTO;

public interface ClienteInteresadoService {
    List <ClienteInteresadoResponseDTO> obtenerTodos();
    List <ClienteInteresadoResponseDTO> obtenerPorProyecto(Long ProyectoId);
    ClienteInteresadoResponseDTO obtenerPorId(Long id );
    ClienteInteresadoResponseDTO crear(ClienteInteresadoRequestDTO dto);
    void eliminar(Long id);

}
