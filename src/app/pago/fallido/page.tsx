"use client";


import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function PagoFallidoPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
      <div className="max-w-md w-full text-center">
        <Image src="/logo.png" alt="Nexa One Life" width={80} height={80} className="mx-auto mb-6 rounded-2xl" />
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <XCircle size={40} style={{ color: "#ef4444" }} />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Pago no completado</h1>
        <p className="mb-8" style={{ color: "#71717a" }}>
          El pago no pudo procesarse. No se realizó ningún cargo. Puedes intentarlo de nuevo.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 mb-3 text-white font-bold py-4 px-6 rounded-2xl transition-all"
          style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-2xl transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "#71717a", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ArrowLeft size={16} />
          Regresar
        </button>
      </div>
    </div>
  );
}
