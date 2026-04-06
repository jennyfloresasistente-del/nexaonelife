"use client";

import { useState } from "react";
import { FolderOpen, Trash2, X, Clock, ExternalLink, Plus } from "lucide-react";
import { Proyecto } from "@/lib/store";

interface Props {
  proyectos: Proyecto[];
  proyectoActualId: string | null;
  onAbrir: (proyecto: Proyecto) => void;
  onEliminar: (id: string) => void;
  onNuevo: () => void;
  onClose: () => void;
}

export function MisProyectos({ proyectos, proyectoActualId, onAbrir, onEliminar, onNuevo, onClose }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onEliminar(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl"
        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
          <div className="flex items-center gap-2">
            <FolderOpen size={15} style={{ color: "#ffd700" }} />
            <span className="font-bold text-white text-sm">Mis proyectos</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,215,0,0.1)", color: "#b8860b", border: "1px solid rgba(255,215,0,0.2)" }}>
              {proyectos.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNuevo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", color: "#ffd700" }}>
              <Plus size={11} /> Nuevo
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "#52525b" }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {proyectos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-8">
              <FolderOpen size={32} style={{ color: "#27272a" }} className="mb-3" />
              <p className="text-sm font-semibold" style={{ color: "#3f3f46" }}>Sin proyectos guardados</p>
              <p className="text-xs mt-1" style={{ color: "#27272a" }}>
                Genera algo y se guardará automáticamente aquí
              </p>
            </div>
          ) : (
            proyectos.map((p) => {
              const isActual = p.id === proyectoActualId;
              const isConfirming = confirmDelete === p.id;
              return (
                <div key={p.id}
                  className="flex items-center gap-3 px-5 py-4 border-b transition-colors cursor-pointer group"
                  style={{ borderColor: "#111", background: isActual ? "rgba(255,215,0,0.03)" : "transparent" }}
                  onClick={() => onAbrir(p)}>

                  {/* Icono */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isActual ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${isActual ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                    <FolderOpen size={14} style={{ color: isActual ? "#ffd700" : "#52525b" }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: isActual ? "#ffd700" : "#e4e4e7" }}>
                        {p.nombre}
                      </span>
                      {isActual && (
                        <span className="text-xs px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: "rgba(255,215,0,0.1)", color: "#b8860b" }}>
                          abierto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: "#3f3f46" }}>
                        <Clock size={9} /> {formatDate(p.updatedAt)}
                      </span>
                      <span className="text-xs" style={{ color: "#3f3f46" }}>
                        {p.versions.length} versión{p.versions.length !== 1 ? "es" : ""}
                      </span>
                      {p.deployUrl && (
                        <span className="text-xs flex items-center gap-1" style={{ color: "#22c55e" }}>
                          <ExternalLink size={9} /> publicado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    style={{
                      background: isConfirming ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                      color: isConfirming ? "#f87171" : "#52525b",
                    }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
