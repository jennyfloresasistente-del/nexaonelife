"use client";

import { useState } from "react";
import { X, Globe, Copy, Check, Loader2, QrCode, ExternalLink, Share2 } from "lucide-react";
import Image from "next/image";

interface Props {
  html: string;
  titulo?: string;
  onClose: () => void;
}

export function ModalPublicar({ html, titulo, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handlePublicar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/publicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, titulo: titulo || "Mi App" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const key = `nexaonelife_app_${data.slug}`;
      localStorage.setItem(key, JSON.stringify({ html, titulo: titulo || "Mi App" }));

      setUrl(data.url);

      const qrRes = await fetch(`/api/qr?url=${encodeURIComponent(data.url)}`);
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setQrUrl(qrData.qr || "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: titulo || "App creada con Nexa One Life",
        text: "Mira esta app que creé con IA en Nexa One Life",
        url,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="rounded-2xl w-full max-w-md overflow-hidden" style={{ background: "#0a0a0a", border: "1px solid rgba(255,215,0,0.15)", boxShadow: "0 0 80px rgba(255,215,0,0.05)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,215,0,0.1)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)" }}>
              <Globe size={16} style={{ color: "#000" }} />
            </div>
            <div>
              <h2 className="font-black text-sm" style={{ color: "#e4e4e7" }}>Publicar App</h2>
              <p className="text-xs" style={{ color: "#52525b" }}>Obtén un link para compartir</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 transition-colors" style={{ color: "#52525b" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!url ? (
            <>
              <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
                  Tu app se publicará en <span className="font-semibold" style={{ color: "#ffd700" }}>preview.nexaoneia.com</span> y cualquier persona podrá verla y usarla desde su celular o computadora.
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(127,29,29,0.15)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <button onClick={handlePublicar} disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#000", boxShadow: "0 4px 20px rgba(255,215,0,0.2)" }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                {loading ? "Publicando..." : "Publicar ahora"}
              </button>
            </>
          ) : (
            <>
              {/* URL publicada */}
              <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                  <span className="text-xs font-bold" style={{ color: "#22c55e" }}>App publicada</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs flex-1 truncate" style={{ color: "#ffd700" }}>{url}</span>
                  <button onClick={handleCopy} className="shrink-0 transition-colors" style={{ color: "#52525b" }}>
                    {copied ? <Check size={14} style={{ color: "#22c55e" }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* QR */}
              {qrUrl && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs" style={{ color: "#52525b" }}>Escanea para abrir en tu celular</p>
                  <div className="bg-white p-3 rounded-2xl">
                    <Image src={qrUrl} alt="QR Code" width={140} height={140} />
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-2">
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa" }}>
                  <ExternalLink size={14} /> Ver app
                </a>
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#000" }}>
                  <Share2 size={14} /> Compartir
                </button>
              </div>

              {/* Compartir en redes */}
              <div className="border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-xs mb-2 text-center" style={{ color: "#3f3f46" }}>Compartir en redes sociales</p>
                <div className="flex gap-2 justify-center">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(59,89,152,0.2)", border: "1px solid rgba(59,89,152,0.3)", color: "#8b9dc3" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    Facebook
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent("Mira esta app que creé con IA en Nexa One Life: " + url)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.2)", color: "#25d366" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a href={`https://www.tiktok.com/upload?description=${encodeURIComponent("App creada con IA: " + url)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#71717a" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                    TikTok
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
