"use client";

import { useState } from "react";
import { X, GitBranch as Github, Loader2, Check, ExternalLink, Download } from "lucide-react";
import { useUserStore } from "@/lib/store";
import Image from "next/image";

interface Props { html: string; onClose: () => void; }

const GRAD = "linear-gradient(135deg, #7c3aed, #06b6d4)";
const PURPLE_DIM = "rgba(124,58,237,0.12)";
const PURPLE_BORDER = "rgba(124,58,237,0.25)";
const PURPLE_LIGHT = "#a78bfa";

export function ModalGitHub({ html, onClose }: Props) {
  const { githubToken, githubRepo, setGithubToken, setGithubRepo } = useUserStore();
  const [token, setToken] = useState(githubToken);
  const [repo, setRepo] = useState(githubRepo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ repoUrl: string; pagesUrl: string; qr: string; created: boolean } | null>(null);
  const [error, setError] = useState("");

  const handlePush = async () => {
    if (!token.trim() || !repo.trim()) { setError("Ingresa tu token de GitHub y el nombre del repositorio"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, repo, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir a GitHub");
      setGithubToken(token); setGithubRepo(repo);
      const qrRes = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.pagesUrl }),
      });
      const qrData = await qrRes.json();
      setResult({ repoUrl: data.repoUrl, pagesUrl: data.pagesUrl, qr: qrData.qr || "", created: data.created });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally { setLoading(false); }
  };

  const downloadQR = () => {
    if (!result?.qr) return;
    const a = document.createElement("a"); a.href = result.qr; a.download = `${repo}-qr.png`; a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#050508", border: `1px solid ${PURPLE_BORDER}`, boxShadow: "0 0 80px rgba(124,58,237,0.15)" }}>

        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: PURPLE_BORDER }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GRAD }}>
              <Github size={18} style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 className="text-lg font-black" style={{ color: "#e4e4e7" }}>Publicar en GitHub</h2>
              <p className="text-xs" style={{ color: "#52525b" }}>Sube tu app y obtén un QR para compartirla</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all" style={{ color: "#52525b" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!result ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#a1a1aa" }}>
                  Token de GitHub (Personal Access Token)
                </label>
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, color: "#e4e4e7" }} />
                <p className="text-xs mt-1" style={{ color: "#3f3f46" }}>
                  Genera uno en{" "}
                  <a href="https://github.com/settings/tokens/new?scopes=repo,public_repo" target="_blank" rel="noopener noreferrer"
                    style={{ color: PURPLE_LIGHT }}>
                    github.com/settings/tokens
                  </a>{" "}
                  con permisos <code className="px-1 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>repo</code>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#a1a1aa" }}>
                  Nombre del repositorio
                </label>
                <input type="text" value={repo}
                  onChange={(e) => setRepo(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                  placeholder="mi-app-nexaonelife"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{ background: PURPLE_DIM, border: `1px solid ${PURPLE_BORDER}`, color: "#e4e4e7" }} />
                <p className="text-xs mt-1" style={{ color: "#3f3f46" }}>
                  Se creará automáticamente. Se habilitará GitHub Pages.
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(127,29,29,0.15)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  {error}
                </div>
              )}

              <button onClick={handlePush} disabled={loading || !token.trim() || !repo.trim()}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: GRAD, color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}>
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Subiendo a GitHub...</>
                ) : (
                  <><Github size={16} /> Publicar y generar QR</>
                )}
              </button>
            </>
          ) : (
            <div className="text-center space-y-5">
              <div className="flex items-center justify-center gap-2" style={{ color: "#22c55e" }}>
                <Check size={20} />
                <span className="font-bold">
                  {result.created ? "Repositorio creado y publicado" : "App actualizada en GitHub"}
                </span>
              </div>

              {result.qr && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm" style={{ color: "#52525b" }}>Escanea para abrir tu app</p>
                  <Image src={result.qr} alt="QR de la app" width={200} height={200}
                    className="rounded-2xl shadow-xl" style={{ border: `1px solid ${PURPLE_BORDER}` }} />
                  <button onClick={downloadQR} className="flex items-center gap-1.5 text-sm transition-colors"
                    style={{ color: PURPLE_LIGHT }}>
                    <Download size={14} /> Descargar QR
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <a href={result.pagesUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: GRAD, color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.3)" }}>
                  <ExternalLink size={14} /> Abrir app en vivo
                </a>
                <a href={result.repoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa" }}>
                  <Github size={14} /> Ver repositorio
                </a>
              </div>

              <p className="text-xs" style={{ color: "#27272a" }}>
                GitHub Pages puede tardar 1-2 minutos en activarse por primera vez.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
