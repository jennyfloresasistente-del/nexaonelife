"use client";

import { useState } from "react";
import { Clock, RotateCcw, X, ChevronRight, Check } from "lucide-react";
import { Version } from "@/lib/store";

interface Props {
  versions: Version[];
  currentHtml: string;
  onRestaurar: (version: Version) => void;
  onClose: () => void;
}

export function HistorialVersiones({ versions, currentHtml, onRestaurar, onClose }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleRestaurar = (v: Version) => {
    if (confirmId === v.id) {
      onRestaurar(v);
      setConfirmId(null);
    } else {
      setConfirmId(v.id);
      setTimeout(() => setConfirmId(null), 3000);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border overflow-hidden shadow-2xl"
        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
          <div className="flex items-center gap-2">
            <Clock size={15} style={{ color: "#ffd700" }} />
            <span className="font-bold text-white text-sm">Historial de versiones</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#b8860b", border: "1px solid rgba(255,215,0,0.2)" }}>
              {versions.length} versiones
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: "#52525b" }}>
            <X size={14} />
          </button>
        </div>

        {/* Lista */}
        <div className="max-h-80 overflow-y-auto">
          {[...versions].reverse().map((v, i) => {
            const isCurrent = v.html === currentHtml;
            const isConfirming = confirmId === v.id;
            return (
              <div key={v.id}
                className="flex items-center gap-3 px-5 py-3.5 border-b transition-colors"
                style={{ borderColor: "#111", background: isCurrent ? "rgba(255,215,0,0.04)" : "transparent" }}>

                {/* Indicador */}
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: isCurrent ? "#ffd700" : i === 0 ? "#52525b" : "#27272a" }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: isCurrent ? "#ffd700" : "#a1a1aa" }}>
                      {v.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(255,215,0,0.1)", color: "#b8860b" }}>
                        actual
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "#3f3f46" }}>{formatTime(v.timestamp)}</p>
                </div>

                {/* Botón restaurar */}
                {!isCurrent && (
                  <button
                    onClick={() => handleRestaurar(v)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                    style={{
                      background: isConfirming ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isConfirming ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                      color: isConfirming ? "#ffd700" : "#71717a",
                    }}>
                    {isConfirming ? <Check size={11} /> : <RotateCcw size={11} />}
                    {isConfirming ? "Confirmar" : "Restaurar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 text-xs" style={{ color: "#27272a" }}>
          Haz clic en "Restaurar" dos veces para confirmar el cambio
        </div>
      </div>
    </div>
  );
}
