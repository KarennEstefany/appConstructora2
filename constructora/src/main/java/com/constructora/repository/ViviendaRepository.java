package com.constructora.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.constructora.entity.Vivienda;
import com.constructora.enums.TipoVivienda;

public interface ViviendaRepository extends JpaRepository<Vivienda, Long> { //Long= es la llave primaria
    List<Vivienda> findByProyectoId(Long proyectoid);
    List<Vivienda> findByDisponibleTrue();

        @Query("""
        SELECT v FROM Vivienda v
        WHERE (:ciudad IS NULL OR LOWER(v.proyecto.ciudad) = LOWER(:ciudad))
        AND (:proyectoId IS NULL OR v.proyecto.id = :proyectoId)
        AND (:tipo IS NULL OR v.tipo = :tipo)
        AND (:habitaciones IS NULL OR v.habitaciones >= :habitaciones)
        AND (:precioMin IS NULL OR v.precio >= :precioMin)
        AND (:precioMax IS NULL OR v.precio <= :precioMax)
        ORDER BY v.id
        """)
    List<Vivienda> filtrar(@Param("ciudad") String ciudad,
                        @Param("proyectoId") Long proyectoId,
                        @Param("tipo") TipoVivienda tipo,
                        @Param("habitaciones") Integer habitaciones,
                        @Param("precioMin") BigDecimal precioMin,
                        @Param("precioMax") BigDecimal precioMax);

@Query("SELECT DISTINCT v.proyecto.ciudad FROM Vivienda v ORDER BY v.proyecto.ciudad")
List<String> findCiudadesConVivienda();

@Query("SELECT DISTINCT v.tipo FROM Vivienda v ORDER BY v.tipo")
List<TipoVivienda> findTipos();

@Query("SELECT DISTINCT v.habitaciones FROM Vivienda v ORDER BY v.habitaciones")
List<Integer> findHabitaciones();

@Query("SELECT DISTINCT v.proyecto.id, v.proyecto.nombre FROM Vivienda v ORDER BY v.proyecto.nombre")
List<Object[]> findProyectosConVivienda();

@Query("SELECT MIN(v.precio) FROM Vivienda v")
BigDecimal findPrecioMinimo();

@Query("SELECT MAX(v.precio) FROM Vivienda v")
BigDecimal findPrecioMaximo();
}
