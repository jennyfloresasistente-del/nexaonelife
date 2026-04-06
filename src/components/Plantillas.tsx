"use client";

import { useState } from "react";
import { X, Sparkles, ChevronRight } from "lucide-react";

interface Plantilla {
  id: string;
  emoji: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  prompt: string;
  color: string;
}

const PLANTILLAS: Plantilla[] = [
  {
    id: "tienda-ropa",
    emoji: "👗",
    nombre: "Tienda de Ropa",
    categoria: "E-commerce",
    descripcion: "Catálogo de productos con carrito de compras y filtros por categoría",
    prompt: "Crea una tienda de ropa online con catálogo de productos, filtros por categoría (mujer, hombre, niños), carrito de compras, página de detalle de producto con tallas y colores, y sección de ofertas. Diseño moderno con colores rosado y blanco.",
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    id: "restaurante",
    emoji: "🍽️",
    nombre: "Restaurante / Menú",
    categoria: "Gastronomía",
    descripcion: "Menú digital con categorías, precios y pedidos por WhatsApp",
    prompt: "Crea un menú digital para restaurante con categorías (entradas, platos fuertes, postres, bebidas), fotos de platillos, precios en pesos mexicanos, botón de pedido por WhatsApp y sección de promociones del día. Diseño cálido con colores naranja y crema.",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: "barberia",
    emoji: "✂️",
    nombre: "Barbería / Salón",
    categoria: "Servicios",
    descripcion: "Agenda de citas, servicios, precios y galería de trabajos",
    prompt: "Crea una app para barbería con lista de servicios y precios, galería de cortes de cabello, formulario de reserva de cita con fecha y hora, información de ubicación y horarios, y botón de contacto por WhatsApp. Diseño masculino con colores negro y dorado.",
    color: "from-yellow-500/20 to-amber-600/20",
  },
  {
    id: "gimnasio",
    emoji: "💪",
    nombre: "Gimnasio / Fitness",
    categoria: "Salud",
    descripcion: "Planes de membresía, clases, horarios y rutinas de ejercicio",
    prompt: "Crea una app para gimnasio con planes de membresía y precios, horario de clases grupales, sección de rutinas de ejercicio por objetivo (perder peso, ganar músculo), galería de instalaciones y formulario de inscripción. Diseño energético con colores negro y rojo.",
    color: "from-red-500/20 to-orange-500/20",
  },
  {
    id: "inmobiliaria",
    emoji: "🏠",
    nombre: "Inmobiliaria",
    categoria: "Bienes Raíces",
    descripcion: "Catálogo de propiedades con filtros, fotos y contacto de agente",
    prompt: "Crea una app inmobiliaria con catálogo de propiedades en venta y renta, filtros por tipo (casa, departamento, local), precio y ubicación, galería de fotos por propiedad, mapa de ubicación, y formulario de contacto con el agente. Diseño profesional con colores azul marino y blanco.",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  {
    id: "clinica",
    emoji: "🏥",
    nombre: "Clínica / Consultorio",
    categoria: "Salud",
    descripcion: "Citas médicas, servicios, doctores y expediente básico",
    prompt: "Crea una app para clínica médica con lista de especialidades y doctores, sistema de citas con calendario, información de servicios y precios, sección de contacto y ubicación, y formulario de registro de paciente. Diseño limpio con colores azul claro y blanco.",
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "escuela",
    emoji: "📚",
    nombre: "Escuela / Academia",
    categoria: "Educación",
    descripcion: "Cursos, horarios, inscripciones y comunicados a padres",
    prompt: "Crea una app para escuela o academia con catálogo de cursos y materias, horarios de clases, sistema de inscripción, tablero de avisos y comunicados, galería de eventos y formulario de contacto. Diseño amigable con colores verde y amarillo.",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "agencia-viajes",
    emoji: "✈️",
    nombre: "Agencia de Viajes",
    categoria: "Turismo",
    descripcion: "Paquetes turísticos, destinos, precios y reservaciones",
    prompt: "Crea una app para agencia de viajes con catálogo de paquetes turísticos nacionales e internacionales, galería de destinos con fotos, precios en pesos mexicanos, formulario de cotización y reserva, y sección de testimonios de clientes. Diseño tropical con colores turquesa y arena.",
    color: "from-teal-500/20 to-cyan-500/20",
  },
  {
    id: "taller-mecanico",
    emoji: "🔧",
    nombre: "Taller Mecánico",
    categoria: "Automotriz",
    descripcion: "Servicios, cotizaciones, citas y seguimiento de vehículo",
    prompt: "Crea una app para taller mecánico con lista de servicios y precios (afinación, frenos, suspensión, etc.), formulario de cotización, agenda de citas, seguimiento del estado del vehículo en reparación, y galería de trabajos realizados. Diseño industrial con colores gris oscuro y naranja.",
    color: "from-gray-500/20 to-slate-500/20",
  },
  {
    id: "pasteleria",
    emoji: "🎂",
    nombre: "Pastelería / Repostería",
    categoria: "Gastronomía",
    descripcion: "Catálogo de pasteles, pedidos personalizados y galería",
    prompt: "Crea una app para pastelería con catálogo de pasteles y postres con fotos y precios, formulario de pedido personalizado con fecha de entrega y diseño deseado, galería de trabajos anteriores, sección de sabores y rellenos disponibles, y botón de pedido por WhatsApp. Diseño dulce con colores rosa pastel y dorado.",
    color: "from-pink-400/20 to-purple-400/20",
  },
  {
    id: "dashboard-ventas",
    emoji: "📊",
    nombre: "Dashboard de Ventas",
    categoria: "Negocios",
    descripcion: "Panel de control con gráficas, KPIs y resumen financiero",
    prompt: "Crea un dashboard de ventas con gráfica de ventas mensuales, KPIs principales (ventas totales, clientes nuevos, ticket promedio, conversión), tabla de productos más vendidos, resumen de ingresos y gastos del mes, y mapa de calor de ventas por día. Diseño profesional oscuro con acentos en azul y verde.",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "portafolio",
    emoji: "🎨",
    nombre: "Portafolio Profesional",
    categoria: "Personal",
    descripcion: "Presentación personal, proyectos, habilidades y contacto",
    prompt: "Crea un portafolio profesional con sección hero con foto y presentación, galería de proyectos con descripción y tecnologías usadas, lista de habilidades con barras de progreso, sección de experiencia laboral y educación, y formulario de contacto. Diseño minimalista moderno con modo oscuro.",
    color: "from-indigo-500/20 to-violet-500/20",
  },
];

const CATEGORIAS = ["Todas", "E-commerce", "Gastronomía", "Servicios", "Salud", "Bienes Raíces", "Educación", "Turismo", "Automotriz", "Negocios", "Personal"];

interface Props {
  onSelectPlantilla: (prompt: string) => void;
  onClose: () => void;
}

export function Plantillas({ onSelectPlantilla, onClose }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  const filtradas = PLANTILLAS.filter((p) => {
    const matchCategoria = categoriaActiva === "Todas" || p.categoria === categoriaActiva;
    const matchBusqueda = busqueda === "" || 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
        <div>
          <h2 className="font-black text-white text-lg">Plantillas</h2>
          <p className="text-xs text-gray-500">{PLANTILLAS.length} plantillas de negocios listas para usar</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-800">
          <X size={20} />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="px-5 pt-4 shrink-0">
        <input
          type="text"
          placeholder="Buscar plantilla..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Categorías */}
      <div className="px-5 pt-3 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                categoriaActiva === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de plantillas */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p className="text-sm">No se encontraron plantillas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filtradas.map((plantilla) => (
              <button
                key={plantilla.id}
                onClick={() => {
                  onSelectPlantilla(plantilla.prompt);
                  onClose();
                }}
                className="group text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plantilla.color} flex items-center justify-center text-2xl mb-3 border border-white/5`}>
                  {plantilla.emoji}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm leading-tight">{plantilla.nombre}</h3>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-0.5" />
                </div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 text-xs mb-2">
                  {plantilla.categoria}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{plantilla.descripcion}</p>
                <div className="mt-3 flex items-center gap-1.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={11} />
                  <span className="text-xs font-semibold">Usar esta plantilla</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
