"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, Download, Share2, Smartphone, Check, Copy, Zap } from "lucide-react";

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
        text: "Mira esta app que creé con inteligencia artificial en nexaoneia.com",
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#000" }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)" }}>
          <Zap size={28} className="text-black" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">App no encontrada</h1>
        <p className="mb-2" style={{ color: "#52525b" }}>Esta app no existe o aún no ha sido publicada.</p>
        <p className="text-xs mb-8" style={{ color: "#27272a" }}>
          nexaoneia.com/preview/{slug}
        </p>
        <a href="https://nexaoneia.com"
          className="px-6 py-3 font-bold rounded-xl transition-all text-black"
          style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)" }}>
          Crear mi propia app
        </a>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#ffd700", borderTopColor: "transparent" }} />
          <p className="text-xs" style={{ color: "#27272a" }}>Cargando app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 shrink-0 z-10"
        style={{ background: "rgba(0,0,0,0.95)", borderBottom: "1px solid #111", backdropFilter: "blur(20px)" }}>

        {/* Logo + título */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black" style={{
              background: "linear-gradient(135deg,#a0a0a0,#e8e8e8,#a8a8a8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Nexa</span>
            <span className="text-sm font-black" style={{
              background: "linear-gradient(135deg,#b8860b,#ffd700,#daa520)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>One</span>
            <span className="text-sm font-black" style={{
              background: "linear-gradient(135deg,#8b4513,#cd853f,#8b4513)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Life</span>
          </div>
          {titulo && (
            <>
              <span style={{ color: "#1f1f1f" }}>·</span>
              <span className="text-sm font-semibold text-white truncate max-w-[160px]">{titulo}</span>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "#71717a", border: "1px solid #111" }}>
            {copied ? <Check size={12} style={{ color: "#22c55e" }} /> : <Copy size={12} />}
            {copied ? "¡Copiado!" : "Copiar link"}
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.04)", color: "#71717a", border: "1px solid #111" }}>
            <Share2 size={12} />
            Compartir
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-black"
            style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)" }}>
            <Download size={12} /> Descargar
          </button>
        </div>
      </header>

      {/* Barra de URL falsa */}
      <div className="flex items-center px-4 py-1.5 shrink-0"
        style={{ background: "#050505", borderBottom: "1px solid #0a0a0a" }}>
        <div className="flex items-center gap-1.5 mr-3">
          {["#ff5f57","#ffbd2e","#28c840"].map(c => (
            <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 rounded-md px-3 py-1 text-xs text-center"
          style={{ background: "#0a0a0a", color: "#27272a", border: "1px solid #111" }}>
          nexaoneia.com/preview/{slug}
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 relative">
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          style={{ minHeight: "calc(100vh - 88px)", background: "#fff" }}
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
          title={titulo || "App preview"}
        />
      </div>

      {/* FAB — Crear la mía */}
      <div className="fixed bottom-5 right-5 z-20">
        <a href="https://nexaoneia.com"
          className="flex items-center gap-2 px-4 py-2.5 text-black text-xs font-black rounded-2xl shadow-2xl transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg,#b8860b,#ffd700)",
            boxShadow: "0 8px 32px rgba(255,215,0,0.25)",
          }}>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#ffd700", borderTopColor: "transparent" }} />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
