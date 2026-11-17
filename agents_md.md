# Contexto del Proyecto Backend: Constructora API

Este documento provee una visión técnica general y detallada del backend de la aplicación **Constructora**, diseñado para interactuar con agentes de Inteligencia Artificial (LLM context prompt) y desarrolladores.

---

## 1. Descripción del Proyecto

Es un sistema API RESTful desarrollado en **Java / Spring Boot** que gestiona la oferta de proyectos inmobiliarios, sus unidades de vivienda disponibles y los clientes interesados en adquirir o solicitar información sobre dichos proyectos. Se conecta a una aplicación frontend desarrollada en **React (Vite)** corriendo por defecto en `http://localhost:5173`.

---

## 2. Tecnologías y Herramientas

- **Lenguaje:** Java 17+
- **Framework Principal:** Spring Boot 3.x
- **Capa Web / API:** Spring Web (MVC)
- **Acceso a Datos:** Spring Data JPA / Hibernate
- **Validaciones:** Jakarta Bean Validation (`jakarta.validation`)
- **Gestión de Boilerplate:** Lombok (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- **Seguridad / CORS:** Configuración personalizada para cliente frontend (`CorsRegistry`)
- **Documentación de Excepciones:** `@RestControllerAdvice` con mapa personalizado de respuestas JSON HTTP.

---

## 3. Estructura del Proyecto

```text
src/main/java/com/constructora/
├── config/
│   ├── CorsConfig.java           # Configuración de CORS para cliente React
│   └── DataInitializer.java      # Precarga de datos semilla al iniciar
├── controllers/
│   ├── ClienteInteresadoController.java
│   ├── ProyectoController.java
│   └── ViviendaController.java
├── dto/
│   ├── ClienteInteresadoRequestDTO.java
│   ├── ClienteInteresadoResponseDTO.java
│   ├── ProyectoRequestDTO.java
│   ├── ProyectoResponseDTO.java
│   ├── ViviendaRequestDTO.java
│   └── ViviendaResponseDTO.java
├── entity/
│   ├── ClienteInteresado.java
│   ├── Proyecto.java
│   └── Vivienda.java
├── enums/
│   ├── EstadoProyecto.java       # EN_PLANOS, EN_CONSTRUCCION, ENTREGA_INMEDIATA, FINALIZADO
│   └── TipoVivienda.java         # CASA, APARTAMENTO, LOTE
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
├── mapper/
│   ├── ClienteInteresadoMapper.java
│   ├── ProyectoMapper.java
│   └── ViviendaMapper.java
├── repository/
│   ├── ClienteInteresadoRepository.java
│   ├── ProyectoRepository.java
│   └── ViviendaRepository.java
└── service/
    ├── ClienteInteresadoService.java
    ├── ProyectoService.java
    ├── ViviendaService.java
    └── impl/
        ├── ClienteInteresadoServiceImpl.java
        ├── ProyectoServiceImpl.java
        └── ViviendaServiceImpl.java
```

---

## 4. Modelo de Datos y Entidades

### `Proyecto`
- **Tabla:** `proyectos`
- **Atributos:**
  - `id` (Long, PK, Auto-increment)
  - `nombre` (String, Not Null)
  - `descripcion` (String, TEXT, Not Null)
  - `ciudad` (String, Not Null)
  - `direccion` (String)
  - `precioDesde` (BigDecimal, Not Null)
  - `imagenUrl` (String)
  - `estado` (Enum: `EstadoProyecto`, EnumType.STRING)
  - `destacado` (Boolean, Default: `false`)

### `Vivienda`
- **Tabla:** `vivienda`
- **Atributos:**
  - `id` (Long, PK, Auto-increment)
  - `titulo` (String, Not Null)
  - `tipo` (Enum: `TipoVivienda`, EnumType.STRING)
  - `habitaciones` (Integer, Not Null)
  - `banos` (Integer, Not Null)
  - `area` (Double, Not Null)
  - `precio` (BigDecimal, Not Null)
  - `imagenUrl` (String)
  - `disponible` (Boolean, Default: `true`)
  - `proyecto` (ManyToOne -> `Proyecto`, FK `proyecto_id`, FetchType.LAZY)

### `ClienteInteresado`
- **Tabla:** `clientes_interesados`
- **Atributos:**
  - `id` (Long, PK, Auto-increment)
  - `nombre` (String, Not Null)
  - `correo` (String, Not Null)
  - `telefono` (String, Not Null)
  - `mensaje` (String, TEXT, Not Null)
  - `fechaRegistro` (LocalDateTime, Not Null)
  - `proyecto` (ManyToOne -> `Proyecto`, FK `proyecto_id`, FetchType.LAZY)

---

## 5. Endpoints de la API REST

### Proyectos (`/api/proyectos`)
- `GET /api/proyectos` -> Obtiene todos los proyectos.
- `GET /api/proyectos/destacados` -> Obtiene sólo proyectos donde `destacado = true`.
- `GET /api/proyectos/{id}` -> Obtiene un proyecto por ID.
- `GET /api/proyectos/{proyectoId}/viviendas` -> Obtiene todas las viviendas asociadas a un proyecto.
- `GET /api/proyectos/{proyectoId}/clientes-interesados` -> Lista los clientes interesados en un proyecto específico.
- `POST /api/proyectos` -> Crea un nuevo proyecto.
- `PUT /api/proyectos/{id}` -> Actualiza los datos de un proyecto.
- `DELETE /api/proyectos/{id}` -> Elimina un proyecto por ID.

### Viviendas (`/api/viviendas`)
- `GET /api/viviendas` -> Obtiene todas las viviendas.
- `GET /api/viviendas/disponibles` -> Obtiene las viviendas donde `disponible = true`.
- `GET /api/viviendas/{id}` -> Obtiene una vivienda por ID.
- `POST /api/viviendas` -> Crea una nueva vivienda asignada a un `proyectoId`.
- `PUT /api/viviendas/{id}` -> Actualiza la vivienda indicada.
- `DELETE /api/viviendas/{id}` -> Elimina una vivienda.

### Clientes Interesados (`/api/clientes-interesados`)
- `GET /api/clientes-interesados` -> Lista global de clientes registrados.
- `GET /api/clientes-interesados/{id}` -> Consulta un cliente por su ID.
- `POST /api/clientes-interesados` -> Registra el interés de un cliente en un proyecto específico.
- `DELETE /api/clientes-interesados/{id}` -> Elimina el registro del cliente.

---

## 6. Convenciones y Reglas de Negocio

1. **Patrón DTO-Entity:** Las entidades JPA nunca se exponen ni reciben directamente en los controladores HTTP. Siempre pasan por Mappers (`toEntity`, `toResponseDTO`, `updateEntity`).
2. **Manejo Centralizado de Excepciones:**
   - La falta de registros lanza `ResourceNotFoundException`, la cual es transformada en respuesta `404 Not Found` estructurada con timestamp y ruta solicitada.
   - Fallos en validaciones Bean Validation (`@Valid`) retornan `400 Bad Request` con un diccionario explícito indicando los campos erróneos y sus mensajes.
3. **CORS:** Configurado explícitamente en `CorsConfig.java` para dar soporte a solicitudes originadas desde `http://localhost:5173` con verbos HTTP (`GET`, `POST`, `PUT`, `DELETE`).