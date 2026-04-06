"use client";


import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function PagoFallidoPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Image src="/logo.png" alt="Nexa One Life" width={80} height={80} className="mx-auto mb-6 rounded-2xl" />
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Pago no completado</h1>
        <p className="text-gray-400 mb-8">
          El pago no pudo procesarse. No se realizó ningún cargo. Puedes intentarlo de nuevo.
        </p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 mx-auto bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all border border-gray-700"
        >
          <ArrowLeft size={16} />
          Volver a Nexa One Life
        </button>
      </div>
    </div>
  );
}
