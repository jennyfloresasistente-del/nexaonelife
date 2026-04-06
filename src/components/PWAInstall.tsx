"use client";
import { useState, useEffect } from "react";
import { Download, X, Smartphone, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const GRAD = "linear-gradient(135deg, #7c3aed, #06b6d4)";

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowBanner(true);
      return;
    }
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  if (installed) return null;

  return (
    <>
      {/* Botón fijo en header — siempre visible */}
      <button
        onClick={handleInstall}
        title="Instalar app"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.25)",
          color: "#a78bfa",
        }}
      >
        {installing ? (
          <Check size={11} style={{ color: "#22c55e" }} />
        ) : (
          <Download size={11} />
        )}
        <span className="hidden sm:inline">Instalar</span>
      </button>

      {/* Banner de instrucciones (fallback cuando no hay prompt nativo) */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{
              background: "#0a0a0f",
              border: "1px solid rgba(124,58,237,0.35)",
              boxShadow: "0 0 40px rgba(124,58,237,0.25)",
            }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: GRAD, boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
              <Smartphone size={18} style={{ color: "#fff" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white mb-1">Instalar Nexa One Life</p>
              <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>
                En Chrome: menú <strong style={{ color: "#a78bfa" }}>⋮</strong> → <strong style={{ color: "#a78bfa" }}>Instalar app</strong><br />
                En Safari: botón <strong style={{ color: "#a78bfa" }}>Compartir</strong> → <strong style={{ color: "#a78bfa" }}>Añadir a inicio</strong>
              </p>
            </div>
            <button onClick={() => setShowBanner(false)}
              className="p-1.5 rounded-lg transition-all shrink-0"
              style={{ color: "#52525b" }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
