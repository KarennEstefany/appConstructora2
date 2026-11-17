import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Link, NavLink, Outlet, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  actualizarProyecto, actualizarVivienda, crearCliente, crearProyecto, 
  crearVivienda, eliminarCliente, eliminarProyecto, eliminarVivienda, 
  listarClientes, listarDestacados, listarProyectos, listarViviendas, 
  obtenerProyecto, opcionesProyectos, opcionesViviendas, viviendasDelProyecto,
} from './api';
import './estilos.css';

const NOMBRE = 'Habita Constructora';
const FOTO = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
const ESTADOS = ['EN_PLANOS', 'EN_CONSTRUCCION', 'ENTREGA_INMEDIATA', 'FINALIZADO'];
const TIPOS = ['CASA', 'APARTAMENTO', 'LOTE'];
const FOTO_VIVIENDAS = 'https://images.pexels.com/photos/7031596/pexels-photo-7031596.jpeg';
const FOTO_PROYECTOS = 'https://images.pexels.com/photos/8134748/pexels-photo-8134748.jpeg';

const pesos = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const estado = (e) => ({ EN_PLANOS: 'En planos', EN_CONSTRUCCION: 'En construcción', ENTREGA_INMEDIATA: 'Entrega inmediata', FINALIZADO: 'Finalizado' }[e] || e);
const tipo = (t) => ({ CASA: 'Casa', APARTAMENTO: 'Apartamento', LOTE: 'Lote' }[t] || t);


const PASO_PRECIO = 10000000;
const precioCorto = (n) => `$${Math.round(n / 1000000)} M`;

// Genera 4 tramos de precio a partir del mínimo y máximo reales
function crearRangos(min, max) {
  if (min == null || max == null) return [];
  const lo = Math.floor(min / PASO_PRECIO) * PASO_PRECIO;
  const hi = Math.max(Math.ceil(max / PASO_PRECIO) * PASO_PRECIO, lo + PASO_PRECIO);
  const tramo = Math.max(PASO_PRECIO, Math.ceil((hi - lo) / 4 / PASO_PRECIO) * PASO_PRECIO);
  const rangos = [];
  for (let d = lo; d < hi; d += tramo) rangos.push({ min: d, max: Math.min(d + tramo, hi) });
  return rangos;
}

function Cargando() {
  return <div className="loading"><div className="loading-spinner" /><p>Cargando...</p></div>;
}

function Vacio({ texto }) {
  return <div className="empty-state"><p>{texto}</p></div>;
}

function aviso(icon, title, text) {
  return Swal.fire({
    icon, title, text,
    timer: icon === 'success' ? 1500 : undefined,
    showConfirmButton: icon !== 'success',
    confirmButtonColor: '#1a365d',
  });
}

async function confirmar(titulo) {
  const r = await Swal.fire({
    title: titulo, icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#c53030', cancelButtonColor: '#718096',
    confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
  });
  return r.isConfirmed;
}

function alEscribir(setDatos) {
  return (e) => {
    const { name, value, type, checked } = e.target;
    setDatos((prev) => ({ ...prev, [name]: type === 'checkbox' ? Boolean(checked) : value }));
  };
}

/* ---------- Menú y pie ---------- */

function Menu() {
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo" onClick={cerrar}>{NOMBRE}</Link>
        <button className="navbar-toggle" onClick={() => setAbierto(!abierto)} aria-label="Menú">
          {abierto ? '✕' : '☰'}
        </button>
        <ul className={`navbar-menu ${abierto ? 'abierto' : ''}`}>
          <li><NavLink to="/" end onClick={cerrar}>Inicio</NavLink></li>
          <li><NavLink to="/proyectos" onClick={cerrar}>Proyectos</NavLink></li>
          <li><NavLink to="/viviendas" onClick={cerrar}>Viviendas</NavLink></li>
          <li><NavLink to="/contacto" onClick={cerrar}>Contacto</NavLink></li>
          <li><NavLink to="/admin/proyectos" className="nav-admin" onClick={cerrar}>Admin</NavLink></li>
        </ul>
      </div>
    </nav>
  );
}

function Pie() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>{NOMBRE}</h3>
          <p>Construimos hogares con calidad y compromiso para tu familia.</p>
        </div>
        <div>
          <h4>Enlaces</h4>
          <ul>
            <li><Link to="/proyectos">Proyectos</Link></li>
            <li><Link to="/viviendas">Viviendas</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <p>Teléfono: (601) 555-1234</p>
          <p>Correo: info@habitaconstructora.com</p>
          <p>Bogotá, Colombia</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {NOMBRE}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function Publica({ children }) {
  return <><Menu /><main>{children}</main><Pie /></>;
}

function Admin() {
  return (
    <>
      <Menu />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h2>Administración</h2>
          <nav>
            <NavLink to="/admin/proyectos">Proyectos</NavLink>
            <NavLink to="/admin/viviendas">Viviendas</NavLink>
            <NavLink to="/admin/clientes">Clientes interesados</NavLink>
          </nav>
        </aside>
        <main className="admin-content"><Outlet /></main>
      </div>
      <Pie />
    </>
  );
}

/* ---------- Tarjetas ---------- */

function TarjetaProyecto({ p }) {
  return (
    <div className="card">
      <img src={p.imagenUrl || FOTO} alt={p.nombre} className="card-image" />
      <div className="card-body">
        <h3>{p.nombre}</h3>
        <p className="card-ciudad">{p.ciudad}</p>
        <span className="badge">{estado(p.estado)}</span>
        <p className="card-precio">Desde {pesos(p.precioDesde)}</p>
        <Link to={`/proyectos/${p.id}`} className="btn btn-secondary">Ver proyecto</Link>
      </div>
    </div>
  );
}

function TarjetaVivienda({ v }) {
  return (
    <div className="card">
      <img src={v.imagenUrl || FOTO} alt={v.titulo} className="card-image" />
      <div className="card-body">
        <h3>{v.titulo}</h3>
        <p className="card-tipo">{tipo(v.tipo)}</p>
        <p className="card-detalles">
          {v.tipo === 'LOTE' ? `${v.area} m²` : `${v.habitaciones} hab · ${v.banos} baños · ${v.area} m²`}
        </p>
        <p className="card-precio">{pesos(v.precio)}</p>
        <span className={`badge ${v.disponible ? 'badge-success' : 'badge-muted'}`}>
          {v.disponible ? 'Disponible' : 'No disponible'}
        </span>
        {v.proyectoNombre && <p className="card-proyecto">Proyecto: {v.proyectoNombre}</p>}
      </div>
    </div>
  );
}

/* ---------- Formulario de contacto ---------- */

function Formulario({ proyectoId = '', titulo = '¿En qué podemos ayudarte?' }) {
  const [proyectos, setProyectos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [aceptoPolitica, setAceptoPolitica] = useState(false);
  const [datos, setDatos] = useState({ nombre: '', telefono: '', correo: '', mensaje: '', proyectoId });

  useEffect(() => {
    listarProyectos().then((r) => setProyectos(r.data)).catch(() => {});
  }, []);

  const enviar = async (e) => {
    e.preventDefault();
    if (!aceptoPolitica) {
      await aviso('warning', 'Aviso', 'Debes aceptar la política de privacidad y el tratamiento de datos personales.');
      return;
    }
    setEnviando(true);
    try {
      await crearCliente({ ...datos, proyectoId: Number(datos.proyectoId) });
      await aviso('success', '¡Mensaje enviado!', 'Nos pondremos en contacto contigo pronto.');
      setDatos({ nombre: '', telefono: '', correo: '', mensaje: '', proyectoId });
      setAceptoPolitica(false);
    } catch (error) {
      await aviso('error', 'Error', error.response?.data?.message || 'No se pudo enviar el formulario.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="interest-form-modern">
      <h3 className="form-card-title">{titulo}</h3>
      <form onSubmit={enviar} className="form-cards-vertical">
        <div className="input-card">
          <label className="input-card-label">Nombre completo *</label>
          <input
            name="nombre"
            value={datos.nombre}
            onChange={alEscribir(setDatos)}
            placeholder="Escribe tu nombre"
            required
            className="input-card-field"
          />
        </div>

        <div className="input-card">
          <label className="input-card-label">Correo electrónico *</label>
          <input
            type="email"
            name="correo"
            value={datos.correo}
            onChange={alEscribir(setDatos)}
            placeholder="tucorreo@ejemplo.com"
            required
            className="input-card-field"
          />
        </div>

        <div className="input-card">
          <label className="input-card-label">Teléfono *</label>
          <input
            name="telefono"
            value={datos.telefono}
            onChange={alEscribir(setDatos)}
            placeholder="+57 300 000 0000"
            required
            className="input-card-field"
          />
        </div>

        <div className="input-card">
          <label className="input-card-label">Me interesa *</label>
          <select
            name="proyectoId"
            value={datos.proyectoId}
            onChange={alEscribir(setDatos)}
            required
            className="input-card-field"
          >
            <option value="">Comprar vivienda (Selecciona un proyecto)</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.ciudad})
              </option>
            ))}
          </select>
        </div>

        <div className="input-card">
          <label className="input-card-label">Mensaje *</label>
          <textarea
            name="mensaje"
            rows="3"
            value={datos.mensaje}
            onChange={alEscribir(setDatos)}
            placeholder="Cuéntanos cómo imaginas tu próximo hogar."
            required
            className="input-card-field"
          />
        </div>

        <label className="form-privacy-group">
          <input
            type="checkbox"
            checked={aceptoPolitica}
            onChange={(e) => setAceptoPolitica(e.target.checked)}
            required
          />
          <span>Acepto la política de privacidad y el tratamiento de mis datos personales.</span>
        </label>

        <button
          type="submit"
          className="btn-submit-modern"
          disabled={enviando || !aceptoPolitica}
        >
          {enviando ? 'Enviando...' : 'Enviar mensaje ↗'}
        </button>

        <p className="form-footer-note">Te responderemos en un día hábil. Sin compromiso.</p>
      </form>
    </div>
  );
}
/* ---------- Filtros ---------- */

function SliderPrecio({ min, max, valorMin, valorMax, onCambio }) {
  const lo = Math.floor(min / PASO_PRECIO) * PASO_PRECIO;
  const hi = Math.max(Math.ceil(max / PASO_PRECIO) * PASO_PRECIO, lo + PASO_PRECIO);
  const desdeUrl = useCallback((v, defecto) => (v === '' ? defecto : Math.min(hi, Math.max(lo, Number(v)))), [hi, lo]);

  const [a, setA] = useState(desdeUrl(valorMin, lo));
  const [b, setB] = useState(desdeUrl(valorMax, hi));

  // Si el filtro cambia desde afuera (buscador del inicio, "Limpiar"), se sincroniza
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setA(desdeUrl(valorMin, lo));
    setB(desdeUrl(valorMax, hi));
  }, [valorMin, valorMax, lo, hi, desdeUrl]);

  // Espera 400 ms después de soltar para consultar al backend
  useEffect(() => {
    const t = setTimeout(() => {
      const nuevoMin = a <= lo ? '' : String(a);
      const nuevoMax = b >= hi ? '' : String(b);
      if (nuevoMin !== valorMin || nuevoMax !== valorMax) onCambio({ precioMin: nuevoMin, precioMax: nuevoMax });
    }, 400);
    return () => clearTimeout(t);
  }, [a, b, hi, lo, onCambio, valorMax, valorMin]);

  const pct = (v) => ((v - lo) / (hi - lo)) * 100;

  return (
    <div className="slider-precio">
      <div className="slider-precio-etiquetas">
        <span>{precioCorto(a)}</span>
        <span>{b >= hi ? `${precioCorto(b)} o más` : precioCorto(b)}</span>
      </div>
      <div className="slider-doble">
        <div className="tramo" style={{ left: `${pct(a)}%`, width: `${pct(b) - pct(a)}%` }} />
        <input type="range" min={lo} max={hi} step={PASO_PRECIO} value={a}
          onChange={(e) => setA(Math.min(Number(e.target.value), b - PASO_PRECIO))} aria-label="Precio mínimo" />
        <input type="range" min={lo} max={hi} step={PASO_PRECIO} value={b}
          onChange={(e) => setB(Math.max(Number(e.target.value), a + PASO_PRECIO))} aria-label="Precio máximo" />
      </div>
    </div>
  );
}

function FiltrosBarra({ modo, opciones, filtros, cambiar, limpiar }) {
  if (!opciones) return null;
  const hayFiltros = Object.values(filtros).some((v) => v !== '');

  return (
    <div className="filtros">
      <div className="filtros-grid">
        <div className="filtro">
          <label>Ciudad</label>
          <select value={filtros.ciudad} onChange={(e) => cambiar({ ciudad: e.target.value })}>
            <option value="">Todas las ciudades</option>
            {(opciones.ciudades || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {modo === 'proyectos' && (
          <div className="filtro">
            <label>Estado</label>
            <select value={filtros.estado} onChange={(e) => cambiar({ estado: e.target.value })}>
              <option value="">Todos los estados</option>
              {(opciones.estados || []).map((s) => <option key={s} value={s}>{estado(s)}</option>)}
            </select>
          </div>
        )}

        {modo === 'viviendas' && (
          <div className="filtro">
            <label>Proyecto</label>
            <select value={filtros.proyectoId} onChange={(e) => cambiar({ proyectoId: e.target.value })}>
              <option value="">Todos los proyectos</option>
              {(opciones.proyectos || []).map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        )}

        <div className="filtro">
          <label>Tipo de vivienda</label>
          <select value={filtros.tipo} onChange={(e) => cambiar({ tipo: e.target.value })}>
            <option value="">Todos los tipos</option>
            {(opciones.tipos || []).map((t) => <option key={t} value={t}>{tipo(t)}</option>)}
          </select>
        </div>

        {modo === 'viviendas' && (
          <div className="filtro">
            <label>Habitaciones</label>
            <select value={filtros.habitaciones} onChange={(e) => cambiar({ habitaciones: e.target.value })}>
              <option value="">Cualquiera</option>
              {(opciones.habitaciones || []).filter((h) => h > 0).map((h) => <option key={h} value={h}>{h}+ hab.</option>)}
            </select>
          </div>
        )}
      </div>

      {opciones.precioMin != null && opciones.precioMax != null && (
        <SliderPrecio min={opciones.precioMin} max={opciones.precioMax}
          valorMin={filtros.precioMin} valorMax={filtros.precioMax} onCambio={cambiar} />
      )}

      {hayFiltros && <button type="button" className="btn btn-sm btn-secondary" onClick={limpiar}>Limpiar filtros</button>}
    </div>
  );
}

function BuscadorInicio() {
  const navigate = useNavigate();
  const [opciones, setOpciones] = useState(null);
  const [ciudad, setCiudad] = useState('');
  const [tipoSel, setTipoSel] = useState('');
  const [rango, setRango] = useState('');

  useEffect(() => {
    opcionesProyectos().then((r) => setOpciones(r.data)).catch(() => {});
  }, []);

  const rangos = opciones ? crearRangos(opciones.precioMin, opciones.precioMax) : [];

  const buscar = () => {
    const p = new URLSearchParams();
    if (ciudad) p.set('ciudad', ciudad);
    if (tipoSel) p.set('tipo', tipoSel);
    if (rango) {
      const [min, max] = rango.split('-');
      p.set('precioMin', min);
      p.set('precioMax', max);
    }
    navigate(p.toString() ? `/proyectos?${p}` : '/proyectos');
  };

  return (
    <section className="buscador">
      <div className="container">
        <span className="buscador-etiqueta">ENCUENTRA TU LUGAR</span>
        <h2>Hay un espacio que se parece a ti.</h2>
        <div className="buscador-campos">
          <div className="filtro">
            <label>Ciudad</label>
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              <option value="">Todas las ciudades</option>
              {(opciones?.ciudades || []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filtro">
            <label>Tipo de inmueble</label>
            <select value={tipoSel} onChange={(e) => setTipoSel(e.target.value)}>
              <option value="">Todos los tipos</option>
              {(opciones?.tipos || []).map((t) => <option key={t} value={t}>{tipo(t)}</option>)}
            </select>
          </div>
          <div className="filtro">
            <label>Rango de precio</label>
            <select value={rango} onChange={(e) => setRango(e.target.value)}>
              <option value="">Todos los precios</option>
              {rangos.map((r) => <option key={r.min} value={`${r.min}-${r.max}`}>{precioCorto(r.min)} – {precioCorto(r.max)}</option>)}
            </select>
          </div>
          <button type="button" className="btn btn-secondary" onClick={buscar}>Buscar ↗</button>
        </div>
      </div>
    </section>
  );
}



/* ---------- Páginas públicas ---------- */

function Inicio() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarDestacados()
      .then((r) => setProyectos(r.data))
      .catch(() => setError('No se pudieron cargar los proyectos destacados.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <section className="hero">

        <div className="hero-overlay">
          <div className="container hero-content">
            <h1>Encuentra el hogar de tus sueños</h1>
            <p>En Habita Constructora construimos proyectos de vivienda con calidad, ubicación privilegiada y las mejores condiciones para tu familia.</p>
            <Link to="/proyectos" className="btn btn-primary">Ver proyectos</Link>
          </div>
        </div>
      </section>
      

      <BuscadorInicio />

      

      

      <section className="section">
        <div className="container">
          <h2 className="section-title">Proyectos destacados</h2>
          {cargando && <Cargando />}
          {error && <p className="error-msg">{error}</p>}
          {!cargando && !error && proyectos.length === 0 && <Vacio texto="No hay proyectos destacados por el momento." />}
          <div className="cards-grid">{proyectos.map((p) => <TarjetaProyecto key={p.id} p={p} />)}</div>
        </div>
      </section>

      <section className="section beneficios">
        <div className="container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <div className="beneficios-grid">
            <div className="beneficio"><span className="beneficio-icon">⌂</span><h3>Calidad constructiva</h3><p>Materiales de primera y acabados de alto nivel en cada proyecto.</p></div>
            <div className="beneficio"><span className="beneficio-icon">✓</span><h3>Confianza y respaldo</h3><p>Años de experiencia construyendo hogares para familias colombianas.</p></div>
            <div className="beneficio"><span className="beneficio-icon">✎</span><h3>Atención personalizada</h3><p>Te acompañamos en cada paso del proceso de compra de tu vivienda.</p></div>
          </div>
        </div>
      </section>

      <section className="section contacto-home">
        <div className="container">
          <div className="contacto-grid">
            <div className="contacto-info">
              <span className="contacto-eyebrow">HABLEMOS DE TU FUTURO</span>
              <h2 className="contacto-titulo">Todo comienza con una conversación.</h2>
              <p className="contacto-desc">
                Cuéntanos qué estás buscando. Un asesor te acompañará para encontrar el espacio ideal para vivir o invertir.
              </p>

              <div className="contacto-detalles">
                <div className="contacto-detalle-item">
                  <h4>Atención personalizada</h4>
                  <p>Lunes a viernes · 8:00 a. m. – 6:00 p. m.</p>
                </div>
                <div className="contacto-detalle-item">
                  <p className="contacto-dato-directo"><strong>Teléfono:</strong> (601) 555-1234</p>
                  <p className="contacto-dato-directo"><strong>Correo:</strong> info@habitaconstructora.com</p>
                  <p className="contacto-dato-directo"><strong>Dirección:</strong> Calle 100 #15-20, Bogotá</p>
                </div>
              </div>
            </div>

            <div className="contacto-form-wrapper">
              <Formulario titulo="¿En qué podemos ayudarte?" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Proyectos() {
  const [params, setParams] = useSearchParams();
  const [proyectos, setProyectos] = useState([]);
  const [opciones, setOpciones] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const filtros = {
    ciudad: params.get('ciudad') || '',
    estado: params.get('estado') || '',
    tipo: params.get('tipo') || '',
    precioMin: params.get('precioMin') || '',
    precioMax: params.get('precioMax') || '',
  };
  const consulta = params.toString();

  const cambiar = (cambios) => {
    const nuevo = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, v]) => (v === '' ? nuevo.delete(k) : nuevo.set(k, v)));
    setParams(nuevo, { replace: true });
  };

  useEffect(() => {
    opcionesProyectos().then((r) => setOpciones(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError(null);
    listarProyectos(Object.fromEntries(new URLSearchParams(consulta)))
      .then((r) => setProyectos(r.data))
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false));
  }, [consulta]);

  const hayFiltros = consulta !== '';

  return (
    <div className="page">
      <div className="page-header page-header-bg" style={{ backgroundImage: `url(${FOTO_PROYECTOS})` }}>
        <div className="container">
          <h1>Nuestros proyectos</h1>
          <p>Conoce los desarrollos de vivienda que tenemos para ti.</p>
        </div>
      </div>
      
      <div className="container section">
        <FiltrosBarra modo="proyectos" opciones={opciones} filtros={filtros}
          cambiar={cambiar} limpiar={() => setParams({}, { replace: true })} />
        {cargando && <Cargando />}
        {error && <p className="error-msg">{error}</p>}
        {!cargando && !error && proyectos.length === 0 && (
          <Vacio texto={hayFiltros ? 'No hay proyectos con esos filtros.' : 'No hay proyectos registrados.'} />
        )}
        <div className="cards-grid">{proyectos.map((p) => <TarjetaProyecto key={p.id} p={p} />)}</div>
      </div>
    </div>
  );
}

function Detalle() {
  const { id } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [viviendas, setViviendas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([obtenerProyecto(id), viviendasDelProyecto(id)])
      .then(([a, b]) => { setProyecto(a.data); setViviendas(b.data); })
      .catch(() => setError('No se pudo cargar el proyecto.'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Cargando />;
  if (error || !proyecto) return <div className="container section"><p className="error-msg">{error}</p></div>;

  return (
    <div className="page">
      <div className="detalle-hero"><img src={proyecto.imagenUrl || FOTO} alt={proyecto.nombre} /></div>
      <div className="container section">
        <div className="detalle-grid">
          <div className="detalle-info">
            <h1>{proyecto.nombre}</h1>
            <span className="badge">{estado(proyecto.estado)}</span>
            <p className="detalle-precio">Desde {pesos(proyecto.precioDesde)}</p>
            <p><strong>Ciudad:</strong> {proyecto.ciudad}</p>
            {proyecto.direccion && <p><strong>Dirección:</strong> {proyecto.direccion}</p>}
            <p className="detalle-descripcion">{proyecto.descripcion}</p>
            {proyecto.mapaUrl && (
              <div className="detalle-mapa-container" style={{ marginTop: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Ubicación en el mapa</h3>
                {(() => {
                  // Si el texto contiene un iframe, extraemos la URL de adentro del src de forma automática
                  let urlMapa = proyecto.mapaUrl;
                  if (urlMapa.includes('<iframe')) {
                    const match = urlMapa.match(/src="([^"]+)"/);
                    if (match) urlMapa = match[1];
                  }
                  return (
                    <iframe
                      title={`Ubicación de ${proyecto.nombre}`}
                      src={urlMapa}
                      width="100%"
                      height="350"
                      style={{ border: 0, borderRadius: '8px' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  );
                })()}
              </div>
            )}
          </div>
        <Formulario key={proyecto.id} proyectoId={String(proyecto.id)} />
        </div>
        <h2 className="section-title">Viviendas del proyecto</h2>
        {viviendas.length === 0
          ? <Vacio texto="Este proyecto aún no tiene viviendas registradas." />
          : <div className="cards-grid">{viviendas.map((v) => <TarjetaVivienda key={v.id} v={v} />)}</div>}
      </div>
    </div>
  );
}

function Viviendas() {
  const [params, setParams] = useSearchParams();
  const [viviendas, setViviendas] = useState([]);
  const [opciones, setOpciones] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const filtros = {
    ciudad: params.get('ciudad') || '',
    proyectoId: params.get('proyectoId') || '',
    tipo: params.get('tipo') || '',
    habitaciones: params.get('habitaciones') || '',
    precioMin: params.get('precioMin') || '',
    precioMax: params.get('precioMax') || '',
  };
  const consulta = params.toString();

  const cambiar = (cambios) => {
    const nuevo = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, v]) => (v === '' ? nuevo.delete(k) : nuevo.set(k, v)));
    setParams(nuevo, { replace: true });
  };

  useEffect(() => {
    opcionesViviendas().then((r) => setOpciones(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError(null);
    listarViviendas(Object.fromEntries(new URLSearchParams(consulta)))
      .then((r) => setViviendas(r.data))
      .catch(() => setError('No se pudieron cargar las viviendas.'))
      .finally(() => setCargando(false));
  }, [consulta]);

  const hayFiltros = consulta !== '';

  return (
    <div className="page">
      <div className="page-header page-header-bg" style={{ backgroundImage: `url(${FOTO_VIVIENDAS})` }}>
        <div className="container">
          <h1>Viviendas disponibles</h1>
          <p>Explora casas, apartamentos y lotes en nuestros proyectos.</p>
        </div>
      </div>
      <div className="container section">
        <FiltrosBarra modo="viviendas" opciones={opciones} filtros={filtros}
          cambiar={cambiar} limpiar={() => setParams({}, { replace: true })} />
        {cargando && <Cargando />}
        {error && <p className="error-msg">{error}</p>}
        {!cargando && !error && viviendas.length === 0 && (
          <Vacio texto={hayFiltros ? 'No hay viviendas con esos filtros.' : 'No hay viviendas registradas.'} />
        )}
        <div className="cards-grid">{viviendas.map((v) => <TarjetaVivienda key={v.id} v={v} />)}</div>
      </div>
    </div>
  );
}

function Contacto() {
  return (
    <div className="page contacto-page">
      <div className="container section">
        <div className="contacto-grid">
          <div className="contacto-info">
            <span className="contacto-eyebrow">HABLEMOS DE TU FUTURO</span>
            <h1 className="contacto-titulo">Todo comienza con una conversación.</h1>
            <p className="contacto-desc">
              Cuéntanos qué estás buscando. Un asesor te acompañará para encontrar el espacio ideal para vivir o invertir.
            </p>

            <div className="contacto-detalles">
              <div className="contacto-detalle-item">
                <h4>Atención personalizada</h4>
                <p>Lunes a viernes · 8:00 a. m. – 6:00 p. m.</p>
              </div>
              <div className="contacto-detalle-item">
                <p className="contacto-dato-directo"><strong>Teléfono:</strong> (601) 555-1234</p>
                <p className="contacto-dato-directo"><strong>Correo:</strong> info@habitaconstructora.com</p>
                <p className="contacto-dato-directo"><strong>Dirección:</strong> Calle 100 #15-20, Bogotá</p>
              </div>
            </div>
          </div>

          <div className="contacto-form-wrapper">
            <Formulario titulo="¿En qué podemos ayudarte?" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Páginas del administrador ---------- */

const proyectoVacio = { nombre: '', descripcion: '', ciudad: '', direccion: '', precioDesde: '', imagenUrl: '', estado: 'EN_PLANOS', destacado: false };

function AdminProyectos() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(proyectoVacio);
  const [editando, setEditando] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  const cargar = () => {
    listarProyectos()
      .then((r) => setLista(r.data))
      .catch(() => aviso('error', 'Error', 'No se pudieron cargar los proyectos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const cuerpo = { ...datos, precioDesde: Number(datos.precioDesde) };
    try {
      if (editando) await actualizarProyecto(editando, cuerpo);
      else await crearProyecto(cuerpo);
      await aviso('success', editando ? 'Proyecto actualizado' : 'Proyecto creado');
      setDatos(proyectoVacio); setEditando(null); setMostrar(false); cargar();
    } catch (error) {
      await aviso('error', 'Error', error.response?.data?.message || 'Error al guardar el proyecto.');
    }
  };

  const borrar = async (id) => {
    if (!(await confirmar('¿Eliminar proyecto?'))) return;
    try { await eliminarProyecto(id); await aviso('success', 'Eliminado'); cargar(); }
    catch { await aviso('error', 'Error', 'No se pudo eliminar el proyecto.'); }
  };

  const editar = (p) => {
    
    setDatos({ nombre: p.nombre, descripcion: p.descripcion, ciudad: p.ciudad, direccion: p.direccion || '', precioDesde: p.precioDesde, imagenUrl: p.imagenUrl || '', mapaUrl: p.mapaUrl || '', estado: p.estado, destacado: p.destacado || false });
    setEditando(p.id); setMostrar(true);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Administrar proyectos</h1>
        <button className="btn btn-primary" onClick={() => { setDatos(proyectoVacio); setEditando(null); setMostrar(true); }}>Nuevo proyecto</button>
      </div>
      {mostrar && (
        <form className="admin-form" onSubmit={guardar}>
          <h2>{editando ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
          <div className="form-row">
            <div className="form-group"><label>Nombre *</label><input name="nombre" value={datos.nombre} onChange={alEscribir(setDatos)} required /></div>
            <div className="form-group"><label>Ciudad *</label><input name="ciudad" value={datos.ciudad} onChange={alEscribir(setDatos)} required /></div>
          </div>
          <div className="form-group"><label>Descripción *</label><textarea name="descripcion" value={datos.descripcion} onChange={alEscribir(setDatos)} required rows="3" /></div>
          <div className="form-row">
            <div className="form-group"><label>Dirección</label><input name="direccion" value={datos.direccion} onChange={alEscribir(setDatos)} /></div>
            <div className="form-group"><label>Precio desde *</label><input name="precioDesde" type="number" min="1" value={datos.precioDesde} onChange={alEscribir(setDatos)} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Estado *</label>
              <select name="estado" value={datos.estado} onChange={alEscribir(setDatos)}>{ESTADOS.map((e) => <option key={e} value={e}>{estado(e)}</option>)}</select>
            </div>
            <div className="form-group"><label>URL imagen</label><input name="imagenUrl" value={datos.imagenUrl} onChange={alEscribir(setDatos)} /></div>
            <div className="form-group">
  <label>URL de Google Maps (Iframe )</label>
  <input 
    name="mapaUrl" 
    value={datos.mapaUrl} 
    onChange={alEscribir(setDatos)} 
    placeholder="Ej: https://www.google.com/maps/embed?pb=..." 
  />
</div>
          </div>
          <div className="form-group checkbox-group"><label><input type="checkbox" name="destacado" checked={datos.destacado} onChange={alEscribir(setDatos)} /> Destacado</label></div>
          <div className="form-actions">
            <button className="btn btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setMostrar(false)}>Cancelar</button>
          </div>
        </form>
      )}
      {cargando ? <Cargando /> : lista.length === 0 ? <Vacio texto="No hay proyectos registrados." /> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Ciudad</th><th>Estado</th><th>Precio desde</th><th>Destacado</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td><td>{p.ciudad}</td><td>{estado(p.estado)}</td><td>{pesos(p.precioDesde)}</td><td>{p.destacado ? 'Sí' : 'No'}</td>
                  <td className="acciones">
                    <button className="btn btn-sm btn-secondary" onClick={() => editar(p)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => borrar(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const viviendaVacia = { titulo: '', tipo: 'CASA', habitaciones: 0, banos: 1, area: '', precio: '', imagenUrl: '', disponible: true, proyectoId: '' };

function AdminViviendas() {
  const [lista, setLista] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState(viviendaVacia);
  const [editando, setEditando] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  const cargar = () => {
    Promise.all([listarViviendas(), listarProyectos()])
      .then(([v, p]) => { setLista(v.data); setProyectos(p.data); })
      .catch(() => aviso('error', 'Error', 'No se pudieron cargar los datos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const cuerpo = {
      ...datos,
      habitaciones: Number(datos.habitaciones), banos: Number(datos.banos),
      area: Number(datos.area), precio: Number(datos.precio), proyectoId: Number(datos.proyectoId), disponible: Boolean(datos.disponible),
    };
    try {
      if (editando) await actualizarVivienda(editando, cuerpo);
      else await crearVivienda(cuerpo);
      await aviso('success', editando ? 'Vivienda actualizada' : 'Vivienda creada');
      setDatos(viviendaVacia); setEditando(null); setMostrar(false); cargar();
    } catch (error) {
      await aviso('error', 'Error', error.response?.data?.message || 'Error al guardar.');
    }
  };

  const borrar = async (id) => {
    if (!(await confirmar('¿Eliminar vivienda?'))) return;
    try { await eliminarVivienda(id); await aviso('success', 'Eliminada'); cargar(); }
    catch { await aviso('error', 'Error', 'No se pudo eliminar.'); }
  };

  const editar = (v) => {
    setDatos({ titulo: v.titulo, tipo: v.tipo, habitaciones: v.habitaciones, banos: v.banos, area: v.area, precio: v.precio, imagenUrl: v.imagenUrl || '', disponible: Boolean(v.disponible), proyectoId: v.proyectoId || '' });
    setEditando(v.id); setMostrar(true);
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Administrar viviendas</h1>
        <button className="btn btn-primary" onClick={() => { setDatos(viviendaVacia); setEditando(null); setMostrar(true); }}>Nueva vivienda</button>
      </div>
      {mostrar && (
        <form className="admin-form" onSubmit={guardar}>
          <h2>{editando ? 'Editar vivienda' : 'Nueva vivienda'}</h2>
          <div className="form-row">
            <div className="form-group"><label>Título *</label><input name="titulo" value={datos.titulo} onChange={alEscribir(setDatos)} required /></div>
            <div className="form-group">
              <label>Tipo *</label>
              <select name="tipo" value={datos.tipo} onChange={alEscribir(setDatos)}>{TIPOS.map((t) => <option key={t} value={t}>{tipo(t)}</option>)}</select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Habitaciones</label><input name="habitaciones" type="number" min="0" value={datos.habitaciones} onChange={alEscribir(setDatos)} /></div>
            <div className="form-group"><label>Baños *</label><input name="banos" type="number" min="1" value={datos.banos} onChange={alEscribir(setDatos)} required /></div>
            <div className="form-group"><label>Área (m²) *</label><input name="area" type="number" min="0.01" step="0.01" value={datos.area} onChange={alEscribir(setDatos)} required /></div>
          
 
</div><div className="form-row">
            <div className="form-group">
              <label>Precio *</label>
              <input 
                name="precio" 
                type="number" 
                min="1" 
                value={datos.precio} 
                onChange={(e) => setDatos({ ...datos, precio: e.target.value === '' ? '' : Number(e.target.value) })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Proyecto *</label>
              <select name="proyectoId" value={datos.proyectoId} onChange={alEscribir(setDatos)} required>
                <option value="">Seleccione</option>
                {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>URL imagen</label><input name="imagenUrl" value={datos.imagenUrl} onChange={alEscribir(setDatos)} /></div>
          
          {/* Checkbox controlado de forma explícita */}
          <div className="form-group checkbox-group">
            <label>
              <input 
                type="checkbox" 
                name="disponible" 
                checked={Boolean(datos.disponible)} 
                onChange={(e) => setDatos(prev => ({ ...prev, disponible: e.target.checked }))} 
              /> 
              Disponible
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setMostrar(false)}>Cancelar</button>
          </div>
        </form>
      )}
      {cargando ? <Cargando /> : lista.length === 0 ? <Vacio texto="No hay viviendas registradas." /> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Título</th><th>Tipo</th><th>Precio</th><th>Proyecto</th><th>Disponible</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.map((v) => (
                <tr key={v.id}>
                  <td>{v.titulo}</td><td>{tipo(v.tipo)}</td><td>{pesos(v.precio)}</td><td>{v.proyectoNombre}</td><td>{v.disponible ? 'Sí' : 'No'}</td>
                  <td className="acciones">
                    <button className="btn btn-sm btn-secondary" onClick={() => editar(v)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => borrar(v.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminClientes() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    
    listarClientes()
      .then((r) => setLista(r.data))
      .catch(() => aviso('error', 'Error', 'No se pudieron cargar los clientes.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const borrar = async (id) => {
    if (!(await confirmar('¿Eliminar registro?'))) return;
    try { await eliminarCliente(id); await aviso('success', 'Eliminado'); cargar(); }
    catch { await aviso('error', 'Error', 'No se pudo eliminar.'); }
  };

  return (
    <div>
      <div className="admin-header"><h1>Clientes interesados</h1></div>
      {cargando ? <Cargando /> : lista.length === 0 ? <Vacio texto="No hay clientes interesados registrados." /> : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Proyecto</th><th>Mensaje</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td><td>{c.telefono}</td><td>{c.correo}</td><td>{c.proyectoNombre}</td>
                  <td className="mensaje-cell">{c.mensaje}</td>
                  <td>{new Date(c.fechaRegistro).toLocaleString('es-CO')}</td>
                  <td className="acciones"><button className="btn btn-sm btn-danger" onClick={() => borrar(c.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- Enrutador principal ---------- */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Publica><Inicio /></Publica>} />
        <Route path="/proyectos" element={<Publica><Proyectos /></Publica>} />
        <Route path="/proyectos/:id" element={<Publica><Detalle /></Publica>} />
        <Route path="/viviendas" element={<Publica><Viviendas /></Publica>} />
        <Route path="/contacto" element={<Publica><Contacto /></Publica>} />
        <Route path="/admin" element={<Admin />}>
          <Route path="proyectos" element={<AdminProyectos />} />
          <Route path="viviendas" element={<AdminViviendas />} />
          <Route path="clientes" element={<AdminClientes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}