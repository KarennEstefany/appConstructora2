package com.constructora.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.constructora.dto.ClienteInteresadoRequestDTO;
import com.constructora.dto.ClienteInteresadoResponseDTO;
import com.constructora.entity.ClienteInteresado;
import com.constructora.entity.Proyecto;
import com.constructora.exception.ResourceNotFoundException;
import com.constructora.mapper.ClienteInteresadoMapper;
import com.constructora.repository.ClienteInteresadoRepository;
import com.constructora.repository.ProyectoRepository;
import com.constructora.services.ClienteInteresadoService;

@Service
public class ClienteInteresadoServiceImpl implements ClienteInteresadoService{
    private ClienteInteresadoRepository clienteInteresadoRepository;
    private ProyectoRepository proyectoRepository;
    private ClienteInteresadoMapper clienteInteresadoMapper;


    public ClienteInteresadoServiceImpl(ClienteInteresadoRepository clienteInteresadoRepository,
            ProyectoRepository proyectoRepository, ClienteInteresadoMapper clienteInteresadoMapper) {
        this.clienteInteresadoRepository = clienteInteresadoRepository;
        this.proyectoRepository = proyectoRepository;
        this.clienteInteresadoMapper = clienteInteresadoMapper;
    }
    @Override
    public List<ClienteInteresadoResponseDTO> obtenerTodos() {
        
        return clienteInteresadoRepository.findAll().stream()
        .map(clienteInteresadoMapper::toResponseDTO).toList();
    }
    @Override
    public List<ClienteInteresadoResponseDTO> obtenerPorProyecto(Long ProyectoId) {
        verificarProyecto(ProyectoId);
        return clienteInteresadoRepository.findByProyectoId(ProyectoId).stream()
        .map(clienteInteresadoMapper::toResponseDTO).toList();
    }
    @Override
    public ClienteInteresadoResponseDTO obtenerPorId(Long id) {
       ClienteInteresado cliente = clienteInteresadoRepository.findById(id)
       .orElseThrow(() -> new ResourceNotFoundException("No se encontro el cliente interesado con id:" + id));
        return clienteInteresadoMapper.toResponseDTO(cliente);
    
    }
    @Override
    public ClienteInteresadoResponseDTO crear(ClienteInteresadoRequestDTO dto) {
        Proyecto proyecto = verificarProyecto(dto.getProyectoId());
        ClienteInteresado cliente= clienteInteresadoMapper.toEntity(dto, proyecto);
        ClienteInteresado guardado = clienteInteresadoRepository.save(cliente);
        return clienteInteresadoMapper.toResponseDTO(guardado);
    }
    @Override
    public void eliminar(Long id) {
       if(!clienteInteresadoRepository.existsById(id)){
        throw new ResourceNotFoundException("No se encuentra el cliente con id "+ id);
       }
       clienteInteresadoRepository.deleteById(id);
    }
 
    private Proyecto verificarProyecto(Long proyectoId){
        return proyectoRepository.findById(proyectoId)
        .orElseThrow(()-> new ResourceNotFoundException("No esta el proyecto con id: " +proyectoId));
    }
    
}
