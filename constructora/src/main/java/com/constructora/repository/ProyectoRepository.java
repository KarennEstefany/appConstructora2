package com.constructora.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.constructora.entity.Proyecto;
import com.constructora.enums.EstadoProyecto;
import com.constructora.enums.TipoVivienda;


public interface ProyectoRepository extends JpaRepository<Proyecto, Long> { //Long= es la llave primaria
    List<Proyecto> findByDestacadoTrue();
    
        @Query("""
        SELECT p FROM Proyecto p
        WHERE (:ciudad IS NULL OR LOWER(p.ciudad) = LOWER(:ciudad))
        AND (:estado IS NULL OR p.estado = :estado)
        AND (
                (:tipo IS NULL AND :precioMin IS NULL AND :precioMax IS NULL)
                OR EXISTS (
                    SELECT 1 FROM Vivienda v
                    WHERE v.proyecto = p
                    AND (:tipo IS NULL OR v.tipo = :tipo)
                    AND (:precioMin IS NULL OR v.precio >= :precioMin)
                    AND (:precioMax IS NULL OR v.precio <= :precioMax)
                )
        )
        ORDER BY p.id
        """)
    List<Proyecto> filtrar(@Param("ciudad") String ciudad,
                        @Param("estado") EstadoProyecto estado,
                        @Param("tipo") TipoVivienda tipo,
                        @Param("precioMin") BigDecimal precioMin,
                        @Param("precioMax") BigDecimal precioMax);

@Query("SELECT DISTINCT p.ciudad FROM Proyecto p ORDER BY p.ciudad")
List<String> findCiudades();

@Query("SELECT DISTINCT p.estado FROM Proyecto p")
List<EstadoProyecto> findEstados();

@Query("SELECT DISTINCT v.tipo FROM Vivienda v ORDER BY v.tipo")
List<TipoVivienda> findTiposVivienda();

@Query("SELECT MIN(v.precio) FROM Vivienda v")
BigDecimal findPrecioMinimo();

@Query("SELECT MAX(v.precio) FROM Vivienda v")
BigDecimal findPrecioMaximo();
}
