"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronRight, Loader2, RefreshCw, X, Lightbulb } from "lucide-react";

interface Props {
  html: string;
  onSugerencia: (texto: string) => void;
}

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

  if (!lower.includes("dark") && !lower.includes("modo oscuro")) {
    sugerencias.push("Agrega un botón de modo oscuro/claro");
  }
  if (lower.includes("form") && !lower.includes("required")) {
    sugerencias.push("Agrega validación a los campos del formulario");
  }
  if (lower.includes("table") || lower.includes("lista") || lower.includes("list")) {
    sugerencias.push("Agrega búsqueda y filtros a la tabla o lista");
    sugerencias.push("Añade paginación para manejar muchos registros");
  }
  if (lower.includes("chart") || lower.includes("graph") || lower.includes("grafica")) {
    sugerencias.push("Agrega más tipos de gráficas (barras, pastel, línea)");
  }
  if (!lower.includes("export") && !lower.includes("descargar")) {
    sugerencias.push("Agrega opción para exportar datos como PDF o Excel");
  }
  if (lower.includes("login") || lower.includes("usuario") || lower.includes("user")) {
    sugerencias.push("Agrega recuperación de contraseña por correo");
    sugerencias.push("Incluye autenticación con Google");
  }
  if (!lower.includes("responsive") && !lower.includes("mobile")) {
    sugerencias.push("Optimiza el diseño para dispositivos móviles");
  }
  if (lower.includes("dashboard") || lower.includes("panel")) {
    sugerencias.push("Agrega notificaciones en tiempo real");
    sugerencias.push("Incluye un resumen de actividad reciente");
  }
  if (!lower.includes("loading") && !lower.includes("spinner")) {
    sugerencias.push("Agrega indicadores de carga mientras se procesan datos");
  }
  if (!lower.includes("toast") && !lower.includes("alert") && !lower.includes("notif")) {
    sugerencias.push("Añade notificaciones visuales para confirmar acciones");
  }

  // Siempre agregar algunas generales si hay pocas
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
  const [aiSugerencias, setAiSugerencias] = useState<string[]>([]);

  useEffect(() => {
    if (!html) return;
    // Sugerencias contextuales instantáneas
    const contextuales = getSugerenciasContextuales(html);
    setSugerencias(contextuales);
    setVisible(true);
    setAiSugerencias([]);
  }, [html]);

  const generarConIA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analiza esta aplicación web y dame exactamente 5 sugerencias concretas y específicas para mejorarla. Responde SOLO con una lista numerada, sin explicaciones largas, cada sugerencia en máximo 10 palabras. App:\n\n${html.substring(0, 2000)}`,
            },
          ],
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

      // Parsear la lista numerada
      const lines = fullText
        .split("\n")
        .filter((l) => /^\d+\./.test(l.trim()))
        .map((l) => l.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 5);

      if (lines.length > 0) {
        setAiSugerencias(lines);
        setSugerencias(lines);
      }
    } catch {
      // Usar sugerencias rápidas como fallback
      const random = [...SUGERENCIAS_RAPIDAS].sort(() => Math.random() - 0.5).slice(0, 5);
      setSugerencias(random);
    } finally {
      setLoading(false);
    }
  };

  if (!html || !visible || sugerencias.length === 0) return null;

  return (
    <div className="border-t border-gray-800 bg-gray-900/50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={13} className="text-yellow-400" />
            <span className="text-xs font-bold text-gray-300">Sugerencias para mejorar tu app</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={generarConIA}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              {loading ? "Analizando..." : "Analizar con IA"}
            </button>
            <button onClick={() => setVisible(false)} className="p-1 text-gray-600 hover:text-gray-400 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {sugerencias.map((s, i) => (
            <button
              key={i}
              onClick={() => onSugerencia(s)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/30 hover:border-indigo-500/40 text-left transition-all group"
            >
              <Sparkles size={11} className="text-indigo-400 shrink-0 group-hover:text-indigo-300" />
              <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors flex-1">{s}</span>
              <ChevronRight size={11} className="text-gray-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
