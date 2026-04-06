"use client";


import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Send, Sparkles, Code2, Eye, Download, Trash2, Copy, Check,
  ChevronDown, Zap, X, Moon, Loader2, GitBranch, QrCode,
  CreditCard, TriangleAlert, Globe,
} from "lucide-react";
import { useUserStore, COSTO_POR_GENERACION } from "@/lib/store";
import { ModalCreditos } from "@/components/ModalCreditos";
import { ModalGitHub } from "@/components/ModalGitHub";
import { PWAInstall } from "@/components/PWAInstall";
import { Sugerencias } from "@/components/Sugerencias";
import { ModalPublicar } from "@/components/ModalPublicar";
import { Plantillas } from "@/components/Plantillas";

type Model = "gpt4" | "claude";
type Message = { role: "user" | "assistant"; content: string };
type Tab = "preview" | "code";

const EXAMPLE_PROMPTS = [
  "Crea un dashboard de ventas con gráficas y estadísticas",
  "Haz una app de lista de tareas con drag & drop",
  "Diseña una landing page para una startup de tecnología",
  "Crea una calculadora con diseño moderno y animaciones",
  "Haz un juego de memoria con cartas coloridas",
  "Diseña un portafolio personal minimalista",
  "Crea una app de clima con animaciones bonitas",
  "Haz un generador de contraseñas seguras",
];

function extractHtml(text: string): string {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) return text.trim();
  return "";
}

function extractExplanation(text: string): string {
  return text.replace(/```html[\s\S]*?```/g, "").trim();
}

export default function NexaOnePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<Model>("gpt4");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentHtml, setCurrentHtml] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [showModalCreditos, setShowModalCreditos] = useState(false);
  const [showModalGitHub, setShowModalGitHub] = useState(false);
  const [showModalPublicar, setShowModalPublicar] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [noCreditos, setNoCreditos] = useState(false);
  const [showPlantillas, setShowPlantillas] = useState(false);

  const { creditos, consumirCredito, incrementarGeneraciones } = useUserStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  };

  const handleGenerate = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    // Verificar créditos
    const ok = consumirCredito();
    if (!ok) {
      setNoCreditos(true);
      return;
    }

    setInput("");
    setShowExamples(false);
    setNoCreditos(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsGenerating(true);
    setStreamingText("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model: model === "claude" ? "claude" : "openai" }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error del servidor");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
        const html = extractHtml(fullText);
        if (html) setCurrentHtml(html);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
      incrementarGeneraciones();

      const finalHtml = extractHtml(fullText);
      if (finalHtml) {
        setCurrentHtml(finalHtml);
        setActiveTab("preview");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ **Error:** ${errorMsg}` },
      ]);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [input, messages, model, isGenerating, consumirCredito, incrementarGeneraciones]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setStreamingText("");
  };

  const handleCopy = async () => {
    if (!currentHtml) return;
    await navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentHtml) return;
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexaonelife-app.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([]);
    setCurrentHtml("");
    setStreamingText("");
    setShowExamples(true);
    setNoCreditos(false);
  };

  const handleGenerateQR = async () => {
    if (!currentHtml) return;
    setQrLoading(true);
    setShowQR(true);
    try {
      // Crear un blob URL temporal para el QR
      const blob = new Blob([currentHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://nexaonelife.app/preview" }),
      });
      const data = await res.json();
      setQrDataUrl(data.qr || "");
    } catch {
      setQrDataUrl("");
    } finally {
      setQrLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const modelLabel = model === "claude" ? "Claude Opus" : "GPT-4o";
  const modelColor = model === "claude" ? "text-orange-400" : "text-green-400";

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <Image src="/logo-sm.png" alt="Nexa One Life" width={34} height={34} className="rounded-xl" priority />
          <div className="flex items-baseline gap-1">
            <span className="font-black text-white text-lg tracking-tight">Nexa</span>
            <span className="font-black text-indigo-400 text-lg tracking-tight">One</span>
            <span className="font-black text-purple-400 text-lg tracking-tight">Life</span>
          </div>
          <span className="hidden sm:inline text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">Beta</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Créditos */}
          <button
            onClick={() => setShowModalCreditos(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
              creditos <= 2
                ? "bg-red-900/30 border-red-700/50 text-red-400 hover:bg-red-900/50"
                : "bg-gray-800 border-gray-700 text-indigo-300 hover:bg-gray-700"
            }`}
          >
            <Zap size={13} />
            <span>{creditos} créditos</span>
            {creditos <= 2 && <TriangleAlert size={12} className="text-red-400" />}
          </button>

          {/* Selector de modelo */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm transition-all"
            >
              <Zap size={13} className={modelColor} />
              <span className={`font-semibold ${modelColor} hidden sm:inline`}>{modelLabel}</span>
              <ChevronDown size={13} className="text-gray-500" />
            </button>
            {showModelMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-1">
                  {(["gpt4", "claude"] as Model[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setModel(m); setShowModelMenu(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-700 transition-colors ${model === m ? "bg-gray-700/60" : ""}`}
                    >
                      <Zap size={13} className={m === "claude" ? "text-orange-400" : "text-green-400"} />
                      <div className="text-left">
                        <div className={`font-semibold ${m === "claude" ? "text-orange-400" : "text-green-400"}`}>
                          {m === "claude" ? "Claude Opus" : "GPT-4o"}
                        </div>
                        <div className="text-xs text-gray-500">{m === "claude" ? "Anthropic" : "OpenAI"}</div>
                      </div>
                      {model === m && <Check size={13} className="ml-auto text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <button onClick={handleClear} className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all" title="Nueva conversación">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Chat ── */}
        <div className="flex flex-col w-full md:w-[400px] lg:w-[440px] shrink-0 border-r border-gray-800">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && showExamples && (
              <div>
                <div className="text-center py-6">
                  <Image src="/logo.png" alt="Nexa One Life" width={72} height={72} className="rounded-2xl mx-auto mb-3 shadow-xl shadow-indigo-500/25" />
                  <h1 className="text-xl font-bold text-white mb-1">Nexa One Life</h1>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Describe lo que quieres construir y la IA lo crea en segundos.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <Zap size={13} className="text-indigo-400" />
                    <span className="text-xs text-gray-400">
                      Tienes <span className="text-indigo-400 font-bold">{creditos} créditos</span> disponibles
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2.5">Ejemplos</p>
                <div className="space-y-1.5">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setInput(ex); textareaRef.current?.focus(); }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/40 hover:border-indigo-500/50 text-sm text-gray-400 hover:text-gray-200 transition-all group"
                    >
                      <span className="text-indigo-500 mr-2 group-hover:text-indigo-400">›</span>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                }`}>
                  {msg.role === "user" ? "U" : <Sparkles size={12} />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-800 text-gray-200 rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    extractHtml(msg.content) ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold mb-1.5">
                          <Check size={11} /> App generada exitosamente
                        </div>
                        {extractExplanation(msg.content) && (
                          <p className="text-gray-400 text-xs leading-relaxed">{extractExplanation(msg.content)}</p>
                        )}
                        <button onClick={() => setActiveTab("preview")} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                          <Eye size={11} /> Ver preview →
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && streamingText && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-gray-800 text-gray-200 text-sm leading-relaxed">
                  {extractHtml(streamingText) ? (
                    <div className="flex items-center gap-1.5 text-indigo-400 text-xs">
                      <Loader2 size={12} className="animate-spin" /> Construyendo tu app...
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap typing-cursor">{streamingText}</p>
                  )}
                </div>
              </div>
            )}

            {isGenerating && !streamingText && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3.5 bg-gray-800">
                  <div className="flex gap-1.5 items-center">
                    {[0, 200, 400].map((d) => (
                      <div key={d} className="w-2 h-2 rounded-full bg-indigo-500 pulse-soft" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sin créditos */}
            {noCreditos && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-2xl p-4 text-center">
                <TriangleAlert size={24} className="text-red-400 mx-auto mb-2" />
                <p className="text-red-300 font-semibold text-sm mb-1">Sin créditos disponibles</p>
                <p className="text-gray-400 text-xs mb-3">Necesitas créditos para generar apps con IA.</p>
                <button
                  onClick={() => setShowModalCreditos(true)}
                  className="flex items-center gap-1.5 mx-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
                >
                  <CreditCard size={14} /> Comprar créditos
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias */}
          {currentHtml && !isGenerating && (
            <Sugerencias
              html={currentHtml}
              onSugerencia={(texto) => {
                setInput(texto);
                textareaRef.current?.focus();
              }}
            />
          )}

          {/* Botón plantillas */}
          <div className="px-3 pt-2 shrink-0">
            <button
              onClick={() => setShowPlantillas(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/40 text-xs font-semibold text-gray-400 hover:text-indigo-300 transition-all"
            >
              <Sparkles size={12} />
              Ver plantillas de negocios
            </button>
          </div>

          {/* Input */}
          <div className="p-3 pt-2 border-t border-gray-800 shrink-0">
            <div className="relative bg-gray-800 rounded-2xl border border-gray-700 focus-within:border-indigo-500/70 transition-all shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={creditos > 0 ? "Describe lo que quieres construir..." : "Sin créditos — compra más para continuar"}
                rows={1}
                className="w-full bg-transparent text-white placeholder-gray-600 text-sm px-4 pt-3.5 pb-2 resize-none outline-none leading-relaxed"
                style={{ maxHeight: "200px" }}
                disabled={isGenerating || creditos <= 0}
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <span className="text-xs text-gray-600">
                  {creditos > 0 ? `${COSTO_POR_GENERACION} crédito por generación` : "Sin créditos"}
                </span>
                {isGenerating ? (
                  <button onClick={handleStop} className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors">
                    <X size={14} className="text-white" />
                  </button>
                ) : creditos <= 0 ? (
                  <button
                    onClick={() => setShowModalCreditos(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    <CreditCard size={12} /> Comprar
                  </button>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={!input.trim()}
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-md shadow-indigo-500/20"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Preview / Código ── */}
        <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
          {/* Tabs + acciones */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 shrink-0 gap-2">
            <div className="flex gap-1">
              {(["preview", "code"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab ? "bg-gray-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {tab === "preview" ? <Eye size={13} /> : <Code2 size={13} />}
                  {tab === "preview" ? "Preview" : "Código"}
                </button>
              ))}
            </div>

            {currentHtml && (
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={handleCopy} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button onClick={handleDownload} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                  <Download size={12} /> Descargar
                </button>
                <button
                  onClick={() => setShowModalGitHub(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
                >
                  <GitBranch size={12} /> GitHub
                </button>
                <button
                  onClick={() => setShowModalPublicar(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Globe size={12} /> Publicar
                </button>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden">
            {!currentHtml ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-3xl bg-gray-800/80 flex items-center justify-center mb-5 border border-gray-700/50">
                  <Moon size={30} className="text-gray-700" />
                </div>
                <h2 className="text-lg font-semibold text-gray-400 mb-2">Tu app aparecerá aquí</h2>
                <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                  Describe lo que quieres construir en el chat y Nexa One Life lo generará en tiempo real.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 justify-center">
                  {["Dashboard", "Landing Page", "Juego", "Calculadora", "Portfolio"].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-gray-800/60 text-gray-600 text-xs border border-gray-700/40">{tag}</span>
                  ))}
                </div>
              </div>
            ) : activeTab === "preview" ? (
              <iframe
                key={currentHtml.length}
                srcDoc={currentHtml}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Preview de la app generada"
              />
            ) : (
              <div className="h-full overflow-auto bg-gray-950">
                <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
                  <code>{currentHtml}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModalCreditos && <ModalCreditos onClose={() => setShowModalCreditos(false)} />}
      {showModalGitHub && currentHtml && <ModalGitHub html={currentHtml} onClose={() => setShowModalGitHub(false)} />}
      {showModalPublicar && currentHtml && <ModalPublicar html={currentHtml} titulo={messages.find(m => m.role === 'user')?.content?.slice(0, 40)} onClose={() => setShowModalPublicar(false)} />}
      {showPlantillas && <Plantillas onSelectPlantilla={(prompt) => { setInput(prompt); setShowExamples(false); }} onClose={() => setShowPlantillas(false)} />}

      {/* Click fuera cierra menú modelo */}
      {showModelMenu && <div className="fixed inset-0 z-40" onClick={() => setShowModelMenu(false)} />}

      {/* Banner de instalación PWA */}
      <PWAInstall />
    </div>
  );
}
