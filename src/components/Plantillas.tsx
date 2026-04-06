"use client";

import { useState } from "react";
import { X, Sparkles, ChevronRight, Search, Layers } from "lucide-react";
import Image from "next/image";

interface Plantilla {
  id: string;
  imagen: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  prompt: string;
  costo: number;
}

const PLANTILLAS: Plantilla[] = [
  // ── GASTRONOMÍA ──────────────────────────────────────────────────────────
  {
    id: "restaurante",
    imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=220&fit=crop&auto=format",
    nombre: "Restaurante",
    categoria: "Gastronomía",
    descripcion: "Menú digital con categorías, precios y pedidos por WhatsApp",
    prompt: "Crea un menú digital para restaurante con categorías (entradas, platos fuertes, postres, bebidas), fotos de platillos, precios en pesos mexicanos, botón de pedido por WhatsApp y sección de promociones del día. Diseño cálido con colores naranja y crema.",
    costo: 1,
  },
  {
    id: "pasteleria",
    imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=220&fit=crop&auto=format",
    nombre: "Pastelería / Repostería",
    categoria: "Gastronomía",
    descripcion: "Catálogo de pasteles, pedidos personalizados y galería",
    prompt: "Crea una app para pastelería con catálogo de pasteles y postres con fotos y precios, formulario de pedido personalizado con fecha de entrega y diseño deseado, galería de trabajos anteriores, sección de sabores y rellenos disponibles, y botón de pedido por WhatsApp. Diseño dulce con colores rosa pastel y dorado.",
    costo: 1,
  },
  {
    id: "cafeteria",
    imagen: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=220&fit=crop&auto=format",
    nombre: "Cafetería / Coffee Shop",
    categoria: "Gastronomía",
    descripcion: "Menú de bebidas, especialidades y pedidos para llevar",
    prompt: "Crea una app para cafetería con menú de bebidas calientes y frías, especialidades de temporada, sistema de pedidos para llevar, programa de lealtad con puntos, y galería de la tienda. Diseño acogedor con colores café, crema y verde.",
    costo: 1,
  },
  {
    id: "pizzeria",
    imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=220&fit=crop&auto=format",
    nombre: "Pizzería",
    categoria: "Gastronomía",
    descripcion: "Carta de pizzas, personalización y delivery",
    prompt: "Crea una app para pizzería con carta de pizzas con ingredientes y precios, opción de personalizar ingredientes, sistema de pedido a domicilio con seguimiento, promociones 2x1, y calculadora de tiempo de entrega. Diseño italiano con rojo y blanco.",
    costo: 1,
  },

  // ── SALUD ─────────────────────────────────────────────────────────────────
  {
    id: "consultorio-medico",
    imagen: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=220&fit=crop&auto=format",
    nombre: "Consultorio Médico",
    categoria: "Salud",
    descripcion: "Citas médicas, expediente básico y servicios",
    prompt: "Crea una app para consultorio médico con sistema de citas con calendario, lista de servicios y especialidades, formulario de registro de paciente, información del doctor y credenciales, horarios de atención, y botón de urgencias. Diseño limpio con colores azul claro y blanco.",
    costo: 2,
  },
  {
    id: "dentista",
    imagen: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=220&fit=crop&auto=format",
    nombre: "Dentista / Odontología",
    categoria: "Salud",
    descripcion: "Servicios dentales, citas y galería de tratamientos",
    prompt: "Crea una app para dentista con catálogo de servicios dentales y precios (limpieza, ortodoncia, blanqueamiento, implantes), sistema de citas online, galería de antes y después, información del consultorio y equipo, y formulario de contacto. Diseño profesional con colores azul y blanco.",
    costo: 2,
  },
  {
    id: "farmacia",
    imagen: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=220&fit=crop&auto=format",
    nombre: "Farmacia",
    categoria: "Salud",
    descripcion: "Catálogo de medicamentos, inventario y ventas",
    prompt: "Crea una app para farmacia con catálogo de medicamentos por categoría, buscador de productos, carrito de compras, control de inventario básico, sección de productos de belleza y cuidado personal, y botón de pedido por WhatsApp. Diseño limpio con colores verde y blanco.",
    costo: 2,
  },
  {
    id: "psicologia",
    imagen: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=220&fit=crop&auto=format",
    nombre: "Psicología / Terapia",
    categoria: "Salud",
    descripcion: "Consultas, citas y recursos de bienestar mental",
    prompt: "Crea una app para psicólogo o terapeuta con presentación profesional, servicios y enfoques terapéuticos, sistema de citas online, recursos de bienestar mental (artículos, ejercicios), preguntas frecuentes, y formulario de primer contacto confidencial. Diseño cálido con colores lavanda y beige.",
    costo: 1,
  },
  {
    id: "gimnasio",
    imagen: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=220&fit=crop&auto=format",
    nombre: "Gimnasio / Fitness",
    categoria: "Salud",
    descripcion: "Membresías, clases, horarios y rutinas",
    prompt: "Crea una app para gimnasio con planes de membresía y precios, horario de clases grupales, sección de rutinas de ejercicio por objetivo (perder peso, ganar músculo), galería de instalaciones y formulario de inscripción. Diseño energético con colores negro y rojo.",
    costo: 2,
  },
  {
    id: "nutricion",
    imagen: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=220&fit=crop&auto=format",
    nombre: "Nutrición / Dietista",
    categoria: "Salud",
    descripcion: "Planes nutricionales, citas y seguimiento",
    prompt: "Crea una app para nutricionista con servicios y planes nutricionales, calculadora de IMC, sistema de citas, galería de recetas saludables, testimonios de pacientes, y formulario de evaluación inicial. Diseño fresco con colores verde y naranja.",
    costo: 1,
  },

  // ── SERVICIOS PROFESIONALES ───────────────────────────────────────────────
  {
    id: "abogado",
    imagen: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=220&fit=crop&auto=format",
    nombre: "Despacho de Abogados",
    categoria: "Legal",
    descripcion: "Servicios legales, áreas de práctica y consulta",
    prompt: "Crea una app para despacho de abogados con presentación del despacho y socios, áreas de práctica (civil, penal, laboral, mercantil, familiar), formulario de consulta inicial, casos de éxito, blog jurídico con artículos, y datos de contacto. Diseño serio y profesional con colores azul marino y dorado.",
    costo: 1,
  },
  {
    id: "contador",
    imagen: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=220&fit=crop&auto=format",
    nombre: "Contador / Despacho Fiscal",
    categoria: "Finanzas",
    descripcion: "Servicios contables, fiscales y financieros",
    prompt: "Crea una app para contador o despacho contable con servicios ofrecidos (contabilidad, declaraciones, nómina, auditoría, CFDI), calculadora de impuestos básica, calendario fiscal con fechas clave, formulario de cotización, y sección de clientes y sectores atendidos. Diseño profesional con colores azul y gris.",
    costo: 2,
  },
  {
    id: "arquitecto",
    imagen: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=220&fit=crop&auto=format",
    nombre: "Arquitecto / Estudio",
    categoria: "Construcción",
    descripcion: "Portafolio de proyectos, servicios y contacto",
    prompt: "Crea una app para estudio de arquitectura con portafolio de proyectos con fotos y descripción, servicios ofrecidos (diseño, remodelación, construcción, interiorismo), proceso de trabajo paso a paso, equipo del estudio, formulario de cotización con tipo de proyecto, y galería de renders. Diseño minimalista con colores negro y blanco.",
    costo: 2,
  },
  {
    id: "notaria",
    imagen: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=220&fit=crop&auto=format",
    nombre: "Notaría / Notario",
    categoria: "Legal",
    descripcion: "Servicios notariales, trámites y citas",
    prompt: "Crea una app para notaría con lista de servicios notariales (escrituras, testamentos, poderes, actas), calculadora de honorarios básica, sistema de citas, documentos requeridos por trámite, preguntas frecuentes, y formulario de contacto. Diseño formal con colores azul oscuro y dorado.",
    costo: 1,
  },
  {
    id: "agencia-marketing",
    imagen: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=220&fit=crop&auto=format",
    nombre: "Agencia de Marketing",
    categoria: "Marketing",
    descripcion: "Servicios digitales, portafolio y resultados",
    prompt: "Crea una app para agencia de marketing digital con servicios (SEO, redes sociales, publicidad, diseño, email marketing), portafolio de campañas con resultados, casos de éxito con métricas, equipo creativo, calculadora de ROI, y formulario de propuesta. Diseño creativo con gradientes y colores vibrantes.",
    costo: 2,
  },

  // ── EDUCACIÓN ─────────────────────────────────────────────────────────────
  {
    id: "escuela",
    imagen: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=220&fit=crop&auto=format",
    nombre: "Escuela / Academia",
    categoria: "Educación",
    descripcion: "Cursos, horarios, inscripciones y comunicados",
    prompt: "Crea una app para escuela o academia con catálogo de cursos y materias, horarios de clases, sistema de inscripción, tablero de avisos y comunicados, galería de eventos y formulario de contacto. Diseño amigable con colores verde y amarillo.",
    costo: 2,
  },
  {
    id: "plataforma-cursos",
    imagen: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=220&fit=crop&auto=format",
    nombre: "Plataforma de Cursos Online",
    categoria: "Educación",
    descripcion: "Cursos en video, progreso y certificados",
    prompt: "Crea una plataforma de cursos online con catálogo de cursos por categoría, vista de curso con módulos y lecciones, barra de progreso del estudiante, sección de instructor, reseñas y calificaciones, y sistema de certificados al completar. Diseño moderno con colores morado y naranja.",
    costo: 3,
  },
  {
    id: "tutoria",
    imagen: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=220&fit=crop&auto=format",
    nombre: "Tutoría / Clases Particulares",
    categoria: "Educación",
    descripcion: "Materias, horarios disponibles y reserva de clases",
    prompt: "Crea una app para tutor o profesor particular con materias que imparte, niveles educativos, horarios disponibles, sistema de reserva de clases, precios por hora, metodología de enseñanza, y testimonios de alumnos. Diseño amigable con colores azul y amarillo.",
    costo: 1,
  },
  {
    id: "estudiante-portafolio",
    imagen: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=220&fit=crop&auto=format",
    nombre: "Portafolio Estudiante",
    categoria: "Educación",
    descripcion: "CV digital, proyectos académicos y habilidades",
    prompt: "Crea un portafolio digital para estudiante universitario con presentación personal, carrera y universidad, proyectos académicos con descripción y tecnologías, habilidades técnicas y blandas, experiencia laboral o prácticas, logros y reconocimientos, y formulario de contacto. Diseño moderno y minimalista.",
    costo: 1,
  },

  // ── BIENES RAÍCES ─────────────────────────────────────────────────────────
  {
    id: "inmobiliaria",
    imagen: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=220&fit=crop&auto=format",
    nombre: "Inmobiliaria",
    categoria: "Bienes Raíces",
    descripcion: "Catálogo de propiedades, filtros y contacto",
    prompt: "Crea una app inmobiliaria con catálogo de propiedades en venta y renta, filtros por tipo (casa, departamento, local), precio y ubicación, galería de fotos por propiedad, mapa de ubicación, y formulario de contacto con el agente. Diseño profesional con colores azul marino y blanco.",
    costo: 2,
  },
  {
    id: "agente-inmobiliario",
    imagen: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=220&fit=crop&auto=format",
    nombre: "Agente Inmobiliario",
    categoria: "Bienes Raíces",
    descripcion: "Propiedades del agente, testimonios y contacto",
    prompt: "Crea una app para agente inmobiliario independiente con presentación personal y trayectoria, propiedades actuales en venta y renta, calculadora de hipoteca, testimonios de clientes, blog con consejos para comprar casa, y formulario de contacto directo. Diseño elegante con colores verde oscuro y dorado.",
    costo: 1,
  },
  {
    id: "renta-vacacional",
    imagen: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=220&fit=crop&auto=format",
    nombre: "Renta Vacacional / Airbnb",
    categoria: "Bienes Raíces",
    descripcion: "Propiedad vacacional con galería, amenidades y reservas",
    prompt: "Crea una app para renta vacacional con galería de fotos de la propiedad, descripción detallada y amenidades, calendario de disponibilidad, precios por temporada, reglas de la casa, mapa de ubicación y atracciones cercanas, y formulario de reserva. Diseño fresco con colores turquesa y blanco.",
    costo: 1,
  },

  // ── E-COMMERCE ────────────────────────────────────────────────────────────
  {
    id: "tienda-ropa",
    imagen: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=220&fit=crop&auto=format",
    nombre: "Tienda de Ropa",
    categoria: "E-commerce",
    descripcion: "Catálogo con carrito, tallas y filtros",
    prompt: "Crea una tienda de ropa online con catálogo de productos, filtros por categoría (mujer, hombre, niños), carrito de compras, página de detalle de producto con tallas y colores, y sección de ofertas. Diseño moderno con colores rosado y blanco.",
    costo: 2,
  },
  {
    id: "tienda-electronica",
    imagen: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400&h=220&fit=crop&auto=format",
    nombre: "Tienda de Electrónica",
    categoria: "E-commerce",
    descripcion: "Gadgets, comparador de productos y carrito",
    prompt: "Crea una tienda de electrónica con catálogo de productos (celulares, laptops, accesorios), comparador de especificaciones, carrito de compras, filtros por precio y marca, sección de ofertas del día, y calculadora de mensualidades. Diseño tecnológico con colores negro y azul eléctrico.",
    costo: 2,
  },
  {
    id: "marketplace",
    imagen: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=220&fit=crop&auto=format",
    nombre: "Marketplace / Tienda General",
    categoria: "E-commerce",
    descripcion: "Múltiples categorías, vendedores y sistema completo",
    prompt: "Crea un marketplace con múltiples categorías de productos, sistema de vendedores con perfil, carrito de compras, sistema de reseñas y calificaciones, buscador avanzado con filtros, panel de vendedor con estadísticas, y proceso de checkout. Diseño moderno con colores naranja y blanco.",
    costo: 3,
  },

  // ── SERVICIOS ─────────────────────────────────────────────────────────────
  {
    id: "barberia",
    imagen: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=220&fit=crop&auto=format",
    nombre: "Barbería / Salón",
    categoria: "Servicios",
    descripcion: "Citas, servicios, precios y galería de trabajos",
    prompt: "Crea una app para barbería con lista de servicios y precios, galería de cortes de cabello, formulario de reserva de cita con fecha y hora, información de ubicación y horarios, y botón de contacto por WhatsApp. Diseño masculino con colores negro y dorado.",
    costo: 1,
  },
  {
    id: "spa-belleza",
    imagen: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=220&fit=crop&auto=format",
    nombre: "Spa / Centro de Belleza",
    categoria: "Servicios",
    descripcion: "Tratamientos, reservas y paquetes especiales",
    prompt: "Crea una app para spa y centro de belleza con catálogo de tratamientos y precios, sistema de reserva de citas, galería de instalaciones, sección de paquetes especiales y promociones, y formulario de contacto. Diseño elegante con colores beige, dorado y blanco.",
    costo: 1,
  },
  {
    id: "veterinaria",
    imagen: "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=400&h=220&fit=crop&auto=format",
    nombre: "Veterinaria / Petshop",
    categoria: "Servicios",
    descripcion: "Servicios veterinarios, tienda y citas",
    prompt: "Crea una app para veterinaria con lista de servicios médicos y precios, tienda de productos para mascotas, sistema de citas, galería de mascotas atendidas, y sección de consejos de cuidado animal. Diseño amigable con colores verde y naranja.",
    costo: 2,
  },
  {
    id: "taller-mecanico",
    imagen: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=220&fit=crop&auto=format",
    nombre: "Taller Mecánico",
    categoria: "Servicios",
    descripcion: "Servicios, cotizaciones, citas y seguimiento",
    prompt: "Crea una app para taller mecánico con lista de servicios y precios (afinación, frenos, suspensión, etc.), formulario de cotización, agenda de citas, seguimiento del estado del vehículo en reparación, y galería de trabajos realizados. Diseño industrial con colores gris oscuro y naranja.",
    costo: 2,
  },
  {
    id: "lavanderia",
    imagen: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=220&fit=crop&auto=format",
    nombre: "Lavandería / Tintorería",
    categoria: "Servicios",
    descripcion: "Servicios, precios por prenda y seguimiento de pedido",
    prompt: "Crea una app para lavandería y tintorería con lista de servicios y precios por tipo de prenda, calculadora de costo, sistema de pedido con recolección a domicilio, seguimiento del estado del pedido, horarios y ubicación, y botón de WhatsApp. Diseño limpio con colores azul y blanco.",
    costo: 1,
  },
  {
    id: "plomero-electricista",
    imagen: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=220&fit=crop&auto=format",
    nombre: "Plomero / Electricista",
    categoria: "Servicios",
    descripcion: "Servicios, tarifas, zona de cobertura y contacto urgente",
    prompt: "Crea una app para plomero o electricista con servicios ofrecidos y tarifas aproximadas, zona de cobertura, botón de llamada de emergencia, formulario de cotización con foto del problema, galería de trabajos realizados, y testimonios de clientes. Diseño funcional con colores azul y naranja.",
    costo: 1,
  },

  // ── TURISMO ───────────────────────────────────────────────────────────────
  {
    id: "agencia-viajes",
    imagen: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=220&fit=crop&auto=format",
    nombre: "Agencia de Viajes",
    categoria: "Turismo",
    descripcion: "Paquetes turísticos, destinos y reservaciones",
    prompt: "Crea una app para agencia de viajes con catálogo de paquetes turísticos nacionales e internacionales, galería de destinos con fotos, precios en pesos mexicanos, formulario de cotización y reserva, y sección de testimonios de clientes. Diseño tropical con colores turquesa y arena.",
    costo: 2,
  },
  {
    id: "hotel",
    imagen: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=220&fit=crop&auto=format",
    nombre: "Hotel / Hostal",
    categoria: "Turismo",
    descripcion: "Habitaciones, tarifas, amenidades y reservas",
    prompt: "Crea una app para hotel con galería de habitaciones y suites, tarifas por temporada, amenidades del hotel, sistema de reserva con fechas, mapa de ubicación y atracciones cercanas, reseñas de huéspedes, y formulario de contacto. Diseño lujoso con colores dorado y negro.",
    costo: 2,
  },

  // ── NEGOCIOS ──────────────────────────────────────────────────────────────
  {
    id: "dashboard-ventas",
    imagen: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=220&fit=crop&auto=format",
    nombre: "Dashboard de Ventas",
    categoria: "Negocios",
    descripcion: "Panel con gráficas, KPIs y resumen financiero",
    prompt: "Crea un dashboard de ventas con gráfica de ventas mensuales, KPIs principales (ventas totales, clientes nuevos, ticket promedio, conversión), tabla de productos más vendidos, resumen de ingresos y gastos del mes, y mapa de calor de ventas por día. Diseño profesional oscuro con acentos en azul y verde.",
    costo: 3,
  },
  {
    id: "crm-clientes",
    imagen: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=220&fit=crop&auto=format",
    nombre: "CRM de Clientes",
    categoria: "Negocios",
    descripcion: "Gestión de clientes, pipeline y seguimiento",
    prompt: "Crea un CRM completo con lista de clientes y contactos, pipeline de ventas con etapas (prospecto, negociación, cerrado), historial de interacciones, recordatorios de seguimiento, y dashboard con métricas de ventas. Diseño profesional oscuro.",
    costo: 3,
  },
  {
    id: "landing-startup",
    imagen: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=220&fit=crop&auto=format",
    nombre: "Landing Page Startup",
    categoria: "Negocios",
    descripcion: "Página de aterrizaje con hero, features y CTA",
    prompt: "Crea una landing page para startup tecnológica con sección hero impactante, propuesta de valor, características del producto con iconos, testimonios de clientes, precios/planes, y llamada a la acción. Diseño moderno con gradientes y animaciones.",
    costo: 1,
  },
  {
    id: "empresa-construccion",
    imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=220&fit=crop&auto=format",
    nombre: "Empresa Constructora",
    categoria: "Construcción",
    descripcion: "Proyectos, servicios, cotizaciones y equipo",
    prompt: "Crea una app para empresa constructora con portafolio de proyectos terminados con fotos, servicios ofrecidos (obra civil, remodelación, diseño estructural), proceso de trabajo, equipo y certificaciones, calculadora de presupuesto básica, y formulario de contacto. Diseño sólido con colores gris, naranja y blanco.",
    costo: 2,
  },

  // ── PERSONAL ──────────────────────────────────────────────────────────────
  {
    id: "portafolio-profesional",
    imagen: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=220&fit=crop&auto=format",
    nombre: "Portafolio Profesional",
    categoria: "Personal",
    descripcion: "CV digital, proyectos, habilidades y contacto",
    prompt: "Crea un portafolio profesional con sección hero con foto y presentación, galería de proyectos con descripción y tecnologías usadas, lista de habilidades con barras de progreso, sección de experiencia laboral y educación, y formulario de contacto. Diseño minimalista moderno con modo oscuro.",
    costo: 1,
  },
  {
    id: "influencer-creador",
    imagen: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=220&fit=crop&auto=format",
    nombre: "Influencer / Creador",
    categoria: "Personal",
    descripcion: "Links, contenido, colaboraciones y redes sociales",
    prompt: "Crea una app para influencer o creador de contenido con bio y foto de perfil, links a todas las redes sociales, galería de contenido destacado, estadísticas de audiencia, sección de colaboraciones y tarifas, y formulario de contacto para marcas. Diseño vibrante y moderno.",
    costo: 1,
  },
  {
    id: "boda-evento",
    imagen: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=220&fit=crop&auto=format",
    nombre: "Boda / Evento Especial",
    categoria: "Personal",
    descripcion: "Invitación digital, RSVP, galería y detalles",
    prompt: "Crea una app para boda o evento especial con invitación digital animada, cuenta regresiva, detalles del evento (fecha, lugar, hora), galería de fotos de la pareja, formulario de confirmación de asistencia (RSVP), mapa de ubicación, y mesa de regalos. Diseño romántico con colores blanco, dorado y rosa.",
    costo: 1,
  },
  {
    id: "organizador-personal",
    imagen: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=220&fit=crop&auto=format",
    nombre: "Organizador Personal",
    categoria: "Personal",
    descripcion: "Tareas, hábitos, metas y seguimiento diario",
    prompt: "Crea una app organizadora personal con lista de tareas con prioridades, tracker de hábitos diarios, sección de metas a corto y largo plazo, diario personal, recordatorios, y estadísticas de productividad semanal. Diseño minimalista con colores neutros y acentos en morado.",
    costo: 2,
  },

  // ── AUTOMOTRIZ ────────────────────────────────────────────────────────────
  {
    id: "agencia-autos",
    imagen: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=220&fit=crop&auto=format",
    nombre: "Agencia de Autos",
    categoria: "Automotriz",
    descripcion: "Catálogo de vehículos, financiamiento y citas",
    prompt: "Crea una app para agencia de autos con catálogo de vehículos nuevos y seminuevos, filtros por marca, modelo y precio, calculadora de financiamiento, comparador de modelos, galería de fotos por vehículo, y formulario de cita para prueba de manejo. Diseño premium con colores negro y plateado.",
    costo: 2,
  },
];

const CATEGORIAS = [
  "Todas", "Gastronomía", "Salud", "Legal", "Finanzas", "Construcción",
  "Educación", "Bienes Raíces", "E-commerce", "Servicios", "Turismo",
  "Negocios", "Marketing", "Personal", "Automotriz",
];

const COSTO_LABEL: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "1 crédito",   color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)" },
  2: { label: "2 créditos",  color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.25)" },
  3: { label: "3 créditos",  color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
};

interface Props {
  onSelectPlantilla: (prompt: string) => void;
  onClose: () => void;
}

export function Plantillas({ onSelectPlantilla, onClose }: Props) {
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  const filtradas = PLANTILLAS.filter((p) => {
    const matchCategoria = categoriaActiva === "Todas" || p.categoria === categoriaActiva;
    const matchBusqueda =
      busqueda === "" ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#000" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
        style={{ borderColor: "#111", background: "rgba(0,0,0,0.98)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Layers size={14} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h2 className="font-black text-white text-sm">Plantillas</h2>
            <p className="text-xs" style={{ color: "#27272a" }}>
              {PLANTILLAS.length} plantillas para todos los negocios
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl transition-colors"
          style={{ color: "#27272a" }}>
          <X size={16} />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="px-5 pt-4 shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#27272a" }} />
          <input
            type="text"
            placeholder="Buscar por sector, nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 pl-9 text-sm text-white outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              caretColor: "#7c3aed",
            }}
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="px-5 pt-3 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIAS.map((cat) => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: categoriaActiva === cat
                  ? "linear-gradient(135deg,#7c3aed,#06b6d4)"
                  : "rgba(255,255,255,0.03)",
                color: categoriaActiva === cat ? "#fff" : "#3f3f46",
                border: categoriaActiva === cat ? "none" : "1px solid rgba(255,255,255,0.05)",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="px-5 pb-2 shrink-0">
        <p className="text-xs" style={{ color: "#1f1f1f" }}>
          {filtradas.length} {filtradas.length === 1 ? "plantilla" : "plantillas"}
          {busqueda && ` para "${busqueda}"`}
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Sparkles size={24} className="mb-3" style={{ color: "#1f1f1f" }} />
            <p className="text-sm font-medium" style={{ color: "#27272a" }}>No se encontraron plantillas</p>
            <p className="text-xs mt-1" style={{ color: "#1a1a1a" }}>Prueba con otro término o categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
            {filtradas.map((plantilla) => {
              const costoInfo = COSTO_LABEL[plantilla.costo] ?? COSTO_LABEL[1];
              return (
                <button key={plantilla.id}
                  onClick={() => { onSelectPlantilla(plantilla.prompt); onClose(); }}
                  className="group text-left rounded-2xl overflow-hidden transition-all duration-200 fade-in"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = "1px solid rgba(124,58,237,0.3)";
                    el.style.background = "rgba(255,255,255,0.04)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.border = "1px solid rgba(255,255,255,0.05)";
                    el.style.background = "rgba(255,255,255,0.02)";
                    el.style.transform = "translateY(0)";
                  }}>

                  {/* Imagen */}
                  <div className="relative w-full overflow-hidden" style={{ height: "130px" }}>
                    <Image
                      src={plantilla.imagen}
                      alt={plantilla.nombre}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                    {/* Gradiente oscuro */}
                    <div className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%)" }} />

                    {/* Badge costo */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: costoInfo.bg,
                        color: costoInfo.color,
                        border: `1px solid ${costoInfo.border}`,
                        backdropFilter: "blur(10px)",
                      }}>
                      {costoInfo.label}
                    </div>

                    {/* Badge categoría */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(0,0,0,0.7)",
                        color: "#52525b",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {plantilla.categoria}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h3 className="font-bold text-white text-xs leading-tight">{plantilla.nombre}</h3>
                      <ChevronRight size={11} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#a78bfa" }} />
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#3f3f46" }}>
                      {plantilla.descripcion}
                    </p>

                    {/* CTA hover */}
                    <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Sparkles size={9} style={{ color: "#a78bfa" }} />
                      <span className="text-xs font-bold" style={{ color: "#7c3aed" }}>
                        Usar plantilla →
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
