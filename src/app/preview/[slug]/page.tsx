"use client";


import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Download, Share2, Smartphone } from "lucide-react";

function PreviewContent() {
  const params = useParams();
  const slug = params.slug as string;
  const [html, setHtml] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const key = `nexaonelife_app_${slug}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setHtml(data.html || "");
        setTitulo(data.titulo || slug);
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [slug]);

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: titulo || "App creada con Nexa One Life",
        text: "Mira esta app que creé con inteligencia artificial en Nexa One Life",
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
        <Image src="/logo.png" alt="Nexa One Life" width={64} height={64} className="rounded-2xl mb-6" />
        <h1 className="text-2xl font-black text-white mb-2">App no encontrada</h1>
        <p className="text-gray-400 mb-6">Esta app no existe o aún no ha sido publicada.</p>
        <a href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all">
          Crear mi propia app
        </a>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-sm.png" alt="Nexa One Life" width={28} height={28} className="rounded-lg" />
          <div>
            <span className="text-xs text-gray-500">Creado con</span>
            <span className="text-xs font-bold text-indigo-400 ml-1">Nexa One Life</span>
          </div>
          {titulo && (
            <>
              <span className="text-gray-700 mx-1">·</span>
              <span className="text-sm font-semibold text-white truncate max-w-[140px]">{titulo}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-all"
          >
            <Share2 size={13} />
            {copied ? "¡Copiado!" : "Compartir"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all"
          >
            <Download size={13} /> Descargar
          </button>
          <a
            href="/"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs text-gray-400 hover:text-white transition-all"
          >
            <ExternalLink size={12} /> Crear la mía
          </a>
        </div>
      </header>

      <div className="flex-1 relative">
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 56px)" }}
          sandbox="allow-scripts allow-forms allow-same-origin"
          title={titulo || "App preview"}
        />
      </div>

      <div className="fixed bottom-4 right-4 z-20">
        <a
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-indigo-500/30 transition-all"
        >
          <Smartphone size={14} />
          Crea tu app gratis
        </a>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
