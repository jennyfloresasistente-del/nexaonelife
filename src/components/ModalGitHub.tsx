"use client";

import { useState } from "react";
import { X, GitBranch as Github, Loader2, Check, ExternalLink, QrCode, Download } from "lucide-react";
import { useUserStore } from "@/lib/store";
import Image from "next/image";

interface Props {
  html: string;
  onClose: () => void;
}

export function ModalGitHub({ html, onClose }: Props) {
  const { githubToken, githubRepo, setGithubToken, setGithubRepo } = useUserStore();
  const [token, setToken] = useState(githubToken);
  const [repo, setRepo] = useState(githubRepo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    repoUrl: string;
    pagesUrl: string;
    qr: string;
    created: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  const handlePush = async () => {
    if (!token.trim() || !repo.trim()) {
      setError("Ingresa tu token de GitHub y el nombre del repositorio");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Push a GitHub
      const res = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, repo, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir a GitHub");

      // Guardar token y repo
      setGithubToken(token);
      setGithubRepo(repo);

      // 2. Generar QR de la URL de GitHub Pages
      setQrLoading(true);
      const qrRes = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.pagesUrl }),
      });
      const qrData = await qrRes.json();

      setResult({
        repoUrl: data.repoUrl,
        pagesUrl: data.pagesUrl,
        qr: qrData.qr || "",
        created: data.created,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setQrLoading(false);
    }
  };

  const downloadQR = () => {
    if (!result?.qr) return;
    const a = document.createElement("a");
    a.href = result.qr;
    a.download = `${repo}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <Github size={22} className="text-white" />
            <div>
              <h2 className="text-lg font-black text-white">Publicar en GitHub</h2>
              <p className="text-xs text-gray-400">Sube tu app y obtén un QR para compartirla</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!result ? (
            <>
              {/* Token */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Token de GitHub (Personal Access Token)
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Genera uno en{" "}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,public_repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    github.com/settings/tokens
                  </a>{" "}
                  con permisos <code className="bg-gray-700 px-1 rounded">repo</code>
                </p>
              </div>

              {/* Repo */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Nombre del repositorio
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                  placeholder="mi-app-nexaonelife"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se creará automáticamente si no existe. Se habilitará GitHub Pages para acceso público.
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePush}
                disabled={loading || !token.trim() || !repo.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all border border-gray-600"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Subiendo a GitHub...</>
                ) : (
                  <><Github size={16} /> Publicar y generar QR</>
                )}
              </button>
            </>
          ) : (
            /* Resultado */
            <div className="text-center space-y-5">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Check size={20} />
                <span className="font-bold">
                  {result.created ? "Repositorio creado y publicado" : "App actualizada en GitHub"}
                </span>
              </div>

              {result.qr && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-400">Escanea para abrir tu app</p>
                  <Image
                    src={result.qr}
                    alt="QR de la app"
                    width={200}
                    height={200}
                    className="rounded-2xl border border-gray-700 shadow-xl"
                  />
                  <button
                    onClick={downloadQR}
                    className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Download size={14} />
                    Descargar QR
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <a
                  href={result.pagesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
                >
                  <ExternalLink size={14} />
                  Abrir app en vivo
                </a>
                <a
                  href={result.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-all border border-gray-700"
                >
                  <Github size={14} />
                  Ver repositorio
                </a>
              </div>

              <p className="text-xs text-gray-600">
                GitHub Pages puede tardar 1-2 minutos en activarse por primera vez.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
