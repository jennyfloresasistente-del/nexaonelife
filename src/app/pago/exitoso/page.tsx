"use client";


import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useUserStore, PLANES } from "@/lib/store";
import { Suspense } from "react";

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addCreditos } = useUserStore();
  const [acreditado, setAcreditado] = useState(false);

  const planId = searchParams.get("plan") || "";
  const creditos = parseInt(searchParams.get("creditos") || "0", 10);
  const plan = PLANES.find((p) => p.id === planId);

  useEffect(() => {
    if (creditos > 0 && !acreditado) {
      addCreditos(creditos);
      setAcreditado(true);
    }
  }, [creditos, acreditado, addCreditos]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Image src="/logo.png" alt="Nexa One Life" width={80} height={80} className="mx-auto mb-6 rounded-2xl" />

        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-400" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2">¡Pago exitoso!</h1>
        <p className="text-gray-400 mb-6">
          Tu compra fue procesada correctamente.
        </p>

        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="text-5xl font-black text-indigo-400 mb-1">+{creditos}</div>
          <div className="text-gray-300 font-semibold">créditos acreditados</div>
          {plan && (
            <div className="mt-3 text-sm text-gray-500">
              Plan <span className="text-indigo-400 font-semibold">{plan.nombre}</span> — ${plan.precio} MXN
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-2xl transition-all"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}
        >
          <Sparkles size={18} />
          Empezar a crear
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 mt-3 font-semibold py-3 px-6 rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "#71717a", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ArrowLeft size={16} />
          Regresar
        </button>
      </div>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Cargando...</div></div>}>
      <PagoExitosoContent />
    </Suspense>
  );
}
