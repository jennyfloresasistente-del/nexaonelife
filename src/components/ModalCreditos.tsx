"use client";

import { useState } from "react";
import { X, Zap, Star, Check, Loader2, CreditCard, Sparkles } from "lucide-react";
import { PLANES } from "@/lib/store";

interface Props {
  onClose: () => void;
}

export function ModalCreditos({ onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleComprar = async (planId: string) => {
    setLoading(planId);
    setError("");
    try {
      const res = await fetch("/api/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, userId: "user_" + Date.now() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar");
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid rgba(255,215,0,0.15)", boxShadow: "0 0 80px rgba(255,215,0,0.05)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
          <div>
            <h2 className="text-xl font-black" style={{ background: "linear-gradient(90deg,#ffd700,#b8860b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Comprar Créditos
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#52525b" }}>Precios en pesos mexicanos (MXN) · Pago seguro con Mercado Pago</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ color: "#52525b" }}>
            <X size={18} />
          </button>
        </div>

        {/* Planes */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANES.map((plan) => (
            <div key={plan.id} className="relative rounded-2xl p-5 transition-all"
              style={{
                background: plan.popular ? "rgba(255,215,0,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${plan.popular ? "rgba(255,215,0,0.25)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: plan.popular ? "0 0 40px rgba(255,215,0,0.05)" : "none",
              }}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#000", boxShadow: "0 4px 15px rgba(255,215,0,0.3)" }}>
                    <Star size={10} fill="#000" /> MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-black text-lg" style={{ color: "#e4e4e7" }}>{plan.nombre}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#52525b" }}>{plan.descripcion}</p>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
                  style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}>
                  <Zap size={12} style={{ color: "#ffd700" }} />
                  <span className="font-bold text-sm" style={{ color: "#ffd700" }}>{plan.creditos}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-black" style={{ color: "#e4e4e7" }}>${plan.precio}</span>
                <span className="text-sm ml-1" style={{ color: "#3f3f46" }}>MXN</span>
                <div className="text-xs mt-0.5" style={{ color: "#3f3f46" }}>
                  ${(plan.precio / plan.creditos).toFixed(2)} por crédito
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {[
                  `${plan.creditos} generaciones con IA`,
                  "Modelos premium incluidos",
                  "Publicar + GitHub + QR",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "#71717a" }}>
                    <Check size={12} style={{ color: "#22c55e" }} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <button onClick={() => handleComprar(plan.id)} disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: plan.popular ? "linear-gradient(135deg,#b8860b,#ffd700)" : "rgba(255,255,255,0.06)",
                  color: plan.popular ? "#000" : "#a1a1aa",
                  border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: plan.popular ? "0 4px 20px rgba(255,215,0,0.2)" : "none",
                }}>
                {loading === plan.id ? (
                  <><Loader2 size={15} className="animate-spin" /> Procesando...</>
                ) : (
                  <><CreditCard size={15} /> Comprar con Mercado Pago</>
                )}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="mx-6 mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(127,29,29,0.15)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <div className="px-6 pb-5 text-center text-xs" style={{ color: "#27272a" }}>
          Pago 100% seguro procesado por Mercado Pago · Los créditos no expiran · Sin suscripción
        </div>
      </div>
    </div>
  );
}
