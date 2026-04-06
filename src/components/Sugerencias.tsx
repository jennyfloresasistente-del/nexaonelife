"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronRight, Loader2, RefreshCw, X, Lightbulb } from "lucide-react";

interface Props { html: string; onSugerencia: (texto: string) => void; }

const PURPLE_DIM = "rgba(124,58,237,0.08)";
const PURPLE_BORDER = "rgba(124,58,237,0.18)";
const PURPLE_LIGHT = "#a78bfa";
const PURPLE = "#7c3aed";

const SUGERENCIAS_RAPIDAS = [
  "Agrega modo oscuro con un botón de toggle",
  "Añade animaciones suaves a los elementos",
  "Incluye un botón para exportar los datos como CSV",
  "Agrega validación de formularios con mensajes de error",
  "Añade una barra de búsqueda para filtrar contenido",
  "Incluye gráficas o estadísticas visuales",
  "Agrega notificaciones tipo toast al guardar",
  "Añade soporte para múltiples idiomas (español/inglés)",
  "Incluye un tutorial o guía de uso para nuevos usuarios",
  "Agrega un historial de acciones con opción de deshacer",
];

function getSugerenciasContextuales(html: string): string[] {
  const sugerencias: string[] = [];
  const lower = html.toLowerCase();
  if (!lower.includes("dark") && !lower.includes("modo oscuro")) sugerencias.push("Agrega un botón de modo oscuro/claro");
  if (lower.includes("form") && !lower.includes("required")) sugerencias.push("Agrega validación a los campos del formulario");
  if (lower.includes("table") || lower.includes("lista") || lower.includes("list")) {
    sugerencias.push("Agrega búsqueda y filtros a la tabla o lista");
    sugerencias.push("Añade paginación para manejar muchos registros");
  }
  if (!lower.includes("export") && !lower.includes("descargar")) sugerencias.push("Agrega opción para exportar datos como PDF o Excel");
  if (lower.includes("login") || lower.includes("usuario") || lower.includes("user")) {
    sugerencias.push("Agrega recuperación de contraseña por correo");
    sugerencias.push("Incluye autenticación con Google");
  }
  if (!lower.includes("responsive") && !lower.includes("mobile")) sugerencias.push("Optimiza el diseño para dispositivos móviles");
  if (lower.includes("dashboard") || lower.includes("panel")) {
    sugerencias.push("Agrega notificaciones en tiempo real");
    sugerencias.push("Incluye un resumen de actividad reciente");
  }
  if (!lower.includes("loading") && !lower.includes("spinner")) sugerencias.push("Agrega indicadores de carga mientras se procesan datos");
  if (!lower.includes("toast") && !lower.includes("alert") && !lower.includes("notif")) sugerencias.push("Añade notificaciones visuales para confirmar acciones");
  if (sugerencias.length < 3) {
    sugerencias.push("Mejora los colores y tipografía para una mejor experiencia");
    sugerencias.push("Agrega transiciones y animaciones suaves");
    sugerencias.push("Incluye un botón de ayuda con instrucciones de uso");
  }
  return sugerencias.slice(0, 5);
}

export function Sugerencias({ html, onSugerencia }: Props) {
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!html) return;
    setSugerencias(getSugerenciasContextuales(html));
    setVisible(true);
  }, [html]);

  const generarConIA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Analiza esta app web y dame exactamente 5 sugerencias concretas para mejorarla. Responde SOLO con lista numerada, máximo 10 palabras cada una. App:\n\n${html.substring(0, 2000)}` }],
          model: "openai",
          mode: "suggestions",
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }
      const lines = fullText.split("\n").filter((l) => /^\d+\./.test(l.trim()))
        .map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).slice(0, 5);
      if (lines.length > 0) setSugerencias(lines);
    } catch {
      setSugerencias([...SUGERENCIAS_RAPIDAS].sort(() => Math.random() - 0.5).slice(0, 5));
    } finally { setLoading(false); }
  };

  if (!html || !visible || sugerencias.length === 0) return null;

  return (
    <div className="border-t shrink-0" style={{ borderColor: PURPLE_BORDER, background: "rgba(0,0,0,0.7)" }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={13} style={{ color: PURPLE_LIGHT }} />
            <span className="text-xs font-bold" style={{ color: "#71717a" }}>Sugerencias para mejorar</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={generarConIA} disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all disabled:opacity-50"
              style={{ color: PURPLE_LIGHT }}>
              {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              {loading ? "Analizando..." : "Analizar con IA"}
            </button>
            <button onClick={() => setVisible(false)} className="p-1 transition-colors" style={{ color: "#27272a" }}>
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {sugerencias.map((s, i) => (
            <button key={i} onClick={() => onSugerencia(s)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all group"
              style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}` }}>
              <Sparkles size={11} style={{ color: PURPLE }} className="shrink-0" />
              <span className="text-xs flex-1 transition-colors group-hover:text-white" style={{ color: "#52525b" }}>{s}</span>
              <ChevronRight size={11} style={{ color: "#27272a" }} className="shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
