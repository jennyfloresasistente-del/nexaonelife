"use client";

import { useState } from "react";
import { X, Zap, Star, Check, Loader2, CreditCard } from "lucide-react";
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
      // Redirigir a Mercado Pago
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-black text-white">Comprar Créditos</h2>
            <p className="text-sm text-gray-400 mt-0.5">Precios en pesos mexicanos (MXN) · Pago seguro con Mercado Pago</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Planes */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLANES.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-5 transition-all ${
                plan.popular
                  ? "border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    <Star size={10} fill="white" />
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-black text-white text-lg">{plan.nombre}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{plan.descripcion}</p>
                </div>
                <div className="flex items-center gap-1 bg-indigo-900/50 px-2.5 py-1 rounded-xl border border-indigo-700/50">
                  <Zap size={12} className="text-indigo-400" />
                  <span className="text-indigo-300 font-bold text-sm">{plan.creditos}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-black text-white">${plan.precio}</span>
                <span className="text-gray-500 text-sm ml-1">MXN</span>
                <div className="text-xs text-gray-500 mt-0.5">
                  ${(plan.precio / plan.creditos).toFixed(2)} por crédito
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                <li className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Check size={12} className="text-green-400 shrink-0" />
                  {plan.creditos} generaciones con IA
                </li>
                <li className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Check size={12} className="text-green-400 shrink-0" />
                  GPT-4o y Claude Opus
                </li>
                <li className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Check size={12} className="text-green-400 shrink-0" />
                  Push a GitHub + QR
                </li>
              </ul>

              <button
                onClick={() => handleComprar(plan.id)}
                disabled={loading !== null}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
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
          <div className="mx-6 mb-4 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="px-6 pb-5 text-center text-xs text-gray-600">
          Pago 100% seguro procesado por Mercado Pago · Los créditos no expiran · Sin suscripción
        </div>
      </div>
    </div>
  );
}
