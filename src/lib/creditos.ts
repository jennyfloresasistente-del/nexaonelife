/**
 * Sistema de créditos dinámico — similar a Lovable
 *
 * Lovable cobra según la complejidad de la tarea:
 * - Cambios simples (texto, color, estilo): 1 crédito
 * - Nuevas páginas / secciones: 2 créditos
 * - Apps completas / dashboards / CRM: 3 créditos
 * - Proyectos muy complejos (multi-página, DB, auth): 5 créditos
 */

export interface CostoGeneracion {
  creditos: number;
  nivel: "simple" | "medio" | "complejo" | "muy-complejo";
  descripcion: string;
}

// Palabras clave por nivel de complejidad
const KEYWORDS_MUY_COMPLEJO = [
  "crm", "erp", "sistema completo", "plataforma", "saas", "multi-página",
  "base de datos", "autenticación", "login", "registro", "usuarios",
  "ecommerce completo", "tienda completa", "marketplace", "inventario completo",
  "facturación", "contabilidad", "gestión completa", "multi-idioma",
];

const KEYWORDS_COMPLEJO = [
  "dashboard", "panel de control", "panel admin", "analytics", "reportes",
  "gráficas", "estadísticas", "kpi", "métricas", "ventas", "finanzas",
  "calendario", "agenda", "reservas", "citas", "sistema de",
  "app para", "aplicación para", "plataforma de", "gestión de",
  "tienda", "catálogo", "carrito", "pedidos", "inventario",
  "mapa", "geolocalización", "tiempo real", "notificaciones",
  "formulario complejo", "multi-paso", "wizard",
];

const KEYWORDS_MEDIO = [
  "página", "sección", "componente", "módulo", "lista", "tabla",
  "formulario", "galería", "portafolio", "landing", "menú",
  "perfil", "configuración", "ajustes", "modal", "sidebar",
  "navbar", "footer", "hero", "card", "grid",
];

const KEYWORDS_SIMPLE = [
  "cambia", "cambiar", "modifica", "modificar", "actualiza", "actualizar",
  "agrega", "agregar", "quita", "quitar", "elimina", "eliminar",
  "color", "fuente", "tamaño", "texto", "título", "botón",
  "arregla", "arreglar", "corrige", "corregir", "fix", "ajusta",
  "más grande", "más pequeño", "más oscuro", "más claro",
  "mueve", "mover", "alinea", "centrar",
];

export function calcularCosto(prompt: string, esEdicion: boolean = false): CostoGeneracion {
  const lower = prompt.toLowerCase().trim();
  const palabras = lower.split(/\s+/).length;

  // Si es una edición de proyecto existente, es más barato
  if (esEdicion) {
    const esCambioSimple = KEYWORDS_SIMPLE.some((k) => lower.includes(k)) || palabras < 15;
    if (esCambioSimple) {
      return { creditos: 1, nivel: "simple", descripcion: "Cambio simple" };
    }
    const esMedio = KEYWORDS_MEDIO.some((k) => lower.includes(k)) || palabras < 40;
    if (esMedio) {
      return { creditos: 1, nivel: "medio", descripcion: "Edición de sección" };
    }
    return { creditos: 2, nivel: "complejo", descripcion: "Edición compleja" };
  }

  // Proyecto nuevo — evaluar complejidad
  const esMuyComplejo = KEYWORDS_MUY_COMPLEJO.some((k) => lower.includes(k));
  if (esMuyComplejo || palabras > 80) {
    return { creditos: 5, nivel: "muy-complejo", descripcion: "Sistema completo" };
  }

  const esComplejo = KEYWORDS_COMPLEJO.some((k) => lower.includes(k));
  if (esComplejo || palabras > 40) {
    return { creditos: 3, nivel: "complejo", descripcion: "App compleja" };
  }

  const esMedio = KEYWORDS_MEDIO.some((k) => lower.includes(k)) || palabras > 15;
  if (esMedio) {
    return { creditos: 2, nivel: "medio", descripcion: "Página o sección" };
  }

  return { creditos: 1, nivel: "simple", descripcion: "Componente simple" };
}

export const NIVEL_COLORS: Record<CostoGeneracion["nivel"], { color: string; bg: string; border: string }> = {
  "simple":       { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
  "medio":        { color: "#ffd700", bg: "rgba(255,215,0,0.1)",   border: "rgba(255,215,0,0.25)" },
  "complejo":     { color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
  "muy-complejo": { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
};
