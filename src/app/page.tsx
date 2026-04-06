"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Send, Sparkles, Code2, Eye, Download, Trash2, Copy, Check,
  X, Loader2, GitBranch, CreditCard, TriangleAlert, Globe,
  Settings, Moon, ArrowRight,
} from "lucide-react";
import { useUserStore, COSTO_POR_GENERACION } from "@/lib/store";
import { ModalCreditos } from "@/components/ModalCreditos";
import { ModalGitHub } from "@/components/ModalGitHub";
import { PWAInstall } from "@/components/PWAInstall";
import { Sugerencias } from "@/components/Sugerencias";
import { ModalPublicar } from "@/components/ModalPublicar";
import { Plantillas } from "@/components/Plantillas";

type Message = { role: "user" | "assistant"; content: string };
type Tab = "preview" | "code";

// Auto-selección de modelo por complejidad del prompt
function selectModel(prompt: string): "openai" | "claude" {
  const lower = prompt.toLowerCase();
  const complexKeywords = [
    "dashboard", "sistema", "crm", "erp", "ecommerce", "tienda", "inventario",
    "complejo", "avanzado", "profesional", "empresa", "negocio", "analytics",
    "base de datos", "autenticación", "multi", "plataforma", "saas",
  ];
  const isComplex = complexKeywords.some((k) => lower.includes(k)) || prompt.length > 200;
  return isComplex ? "claude" : "openai";
}

const EXAMPLE_PROMPTS = [
  "Crea un dashboard de ventas con gráficas y estadísticas",
  "Haz una landing page para una startup de tecnología",
  "Diseña una calculadora con animaciones modernas",
  "Crea un portafolio personal minimalista y elegante",
  "Haz un juego de memoria con cartas coloridas",
  "Diseña un generador de contraseñas seguras",
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentHtml, setCurrentHtml] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [showModalCreditos, setShowModalCreditos] = useState(false);
  const [showModalGitHub, setShowModalGitHub] = useState(false);
  const [showModalPublicar, setShowModalPublicar] = useState(false);
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

    const ok = consumirCredito();
    if (!ok) { setNoCreditos(true); return; }

    setInput("");
    setShowExamples(false);
    setNoCreditos(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsGenerating(true);
    setStreamingText("");

    // Auto-selección de modelo por complejidad
    const autoModel = selectModel(prompt);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model: autoModel }),
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
      if (finalHtml) { setCurrentHtml(finalHtml); setActiveTab("preview"); }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ **Error:** ${errorMsg}` }]);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [input, messages, isGenerating, consumirCredito, incrementarGeneraciones]);

  const handleStop = () => { abortRef.current?.abort(); setIsGenerating(false); setStreamingText(""); };
  const handleCopy = async () => { if (!currentHtml) return; await navigator.clipboard.writeText(currentHtml); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = () => {
    if (!currentHtml) return;
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nexaonelife.html"; a.click();
    URL.revokeObjectURL(url);
  };
  const handleClear = () => { setMessages([]); setCurrentHtml(""); setStreamingText(""); setShowExamples(true); setNoCreditos(false); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#000" }}>

      {/* ── Header estilo Lovable ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ background: "#000", borderColor: "#1a1a1a" }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo-sm.png" alt="Nexa One Life" width={32} height={32} className="rounded-xl" priority />
          <div className="flex items-baseline gap-1">
            <span className="font-black text-base tracking-tight"
              style={{ background: "linear-gradient(90deg,#c0c0c0,#e8e8e8,#a8a8a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nexa
            </span>
            <span className="font-black text-base tracking-tight"
              style={{ background: "linear-gradient(90deg,#b8860b,#ffd700,#daa520)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              One
            </span>
            <span className="font-black text-base tracking-tight"
              style={{ background: "linear-gradient(90deg,#cd7f32,#e8a96e,#b87333)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Life
            </span>
          </div>
        </div>

        {/* Acciones header */}
        <div className="flex items-center gap-2">
          {/* Créditos */}
          <button
            onClick={() => setShowModalCreditos(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: creditos <= 2 ? "rgba(127,29,29,0.3)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${creditos <= 2 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
              color: creditos <= 2 ? "#f87171" : "#a1a1aa",
            }}
          >
            <Sparkles size={11} />
            <span>{creditos} créditos</span>
            {creditos <= 2 && <TriangleAlert size={11} />}
          </button>

          {/* Botón Admin */}
          <a
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#a1a1aa",
            }}
          >
            <Settings size={11} />
            <span className="hidden sm:inline">Admin</span>
          </a>

          {messages.length > 0 && (
            <button onClick={handleClear}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "#52525b", background: "transparent" }}
              title="Nueva conversación"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel izquierdo: Chat ── */}
        <div className="flex flex-col w-full md:w-[400px] lg:w-[420px] shrink-0 border-r"
          style={{ background: "#000", borderColor: "#1a1a1a" }}>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

            {/* Estado vacío */}
            {messages.length === 0 && showExamples && (
              <div className="fade-in">
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Sparkles size={22} style={{ color: "#ffd700" }} />
                  </div>
                  <h1 className="text-lg font-bold text-white mb-1.5">¿Qué quieres crear hoy?</h1>
                  <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: "#52525b" }}>
                    Describe tu idea y la IA la construirá en segundos.
                  </p>
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#3f3f46" }}>Ejemplos</p>
                <div className="space-y-1.5">
                  {EXAMPLE_PROMPTS.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => { setInput(ex); textareaRef.current?.focus(); }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all group flex items-center justify-between"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#71717a" }}
                    >
                      <span className="group-hover:text-white transition-colors">{ex}</span>
                      <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" style={{ color: "#ffd700" }} />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowPlantillas(true)}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)", color: "#b8860b" }}
                >
                  <Sparkles size={11} /> Ver plantillas de negocios
                </button>
              </div>
            )}

            {/* Mensajes */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: msg.role === "user"
                      ? "linear-gradient(135deg,#b8860b,#ffd700)"
                      : "rgba(255,255,255,0.08)",
                    color: msg.role === "user" ? "#000" : "#a1a1aa",
                  }}>
                  {msg.role === "user" ? "T" : <Sparkles size={10} />}
                </div>
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                  style={{
                    background: msg.role === "user" ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${msg.role === "user" ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.06)"}`,
                    color: msg.role === "user" ? "#ffd700" : "#a1a1aa",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  }}>
                  {msg.role === "assistant" ? (
                    extractHtml(msg.content) ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: "#22c55e" }}>
                          <Check size={10} /> Generado exitosamente
                        </div>
                        {extractExplanation(msg.content) && (
                          <p className="leading-relaxed" style={{ color: "#71717a" }}>{extractExplanation(msg.content)}</p>
                        )}
                        <button onClick={() => setActiveTab("preview")}
                          className="mt-2 text-xs flex items-center gap-1 transition-colors"
                          style={{ color: "#b8860b" }}>
                          <Eye size={10} /> Ver resultado →
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

            {/* Streaming */}
            {isGenerating && streamingText && (
              <div className="flex gap-2.5 fade-in">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Sparkles size={10} style={{ color: "#ffd700" }} />
                </div>
                <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#a1a1aa", borderRadius: "4px 16px 16px 16px" }}>
                  {extractHtml(streamingText) ? (
                    <div className="flex items-center gap-1.5" style={{ color: "#b8860b" }}>
                      <Loader2 size={11} className="animate-spin" /> Construyendo...
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap typing-cursor">{streamingText}</p>
                  )}
                </div>
              </div>
            )}

            {/* Dots loading */}
            {isGenerating && !streamingText && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Sparkles size={10} style={{ color: "#ffd700" }} />
                </div>
                <div className="rounded-2xl px-3.5 py-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px 16px 16px 16px" }}>
                  <div className="flex gap-1 items-center">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full pulse-soft"
                        style={{ background: "#ffd700", animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sin créditos */}
            {noCreditos && (
              <div className="rounded-2xl p-4 text-center"
                style={{ background: "rgba(127,29,29,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <TriangleAlert size={20} className="mx-auto mb-2" style={{ color: "#f87171" }} />
                <p className="font-semibold text-sm mb-1" style={{ color: "#fca5a5" }}>Sin créditos</p>
                <p className="text-xs mb-3" style={{ color: "#71717a" }}>Necesitas créditos para continuar.</p>
                <button onClick={() => setShowModalCreditos(true)}
                  className="flex items-center gap-1.5 mx-auto text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700" }}>
                  <CreditCard size={12} /> Comprar créditos
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Sugerencias */}
          {currentHtml && !isGenerating && (
            <Sugerencias html={currentHtml} onSugerencia={(texto) => { setInput(texto); textareaRef.current?.focus(); }} />
          )}

          {/* Input estilo Lovable */}
          <div className="p-3 border-t shrink-0" style={{ borderColor: "#1a1a1a" }}>
            <div className="relative rounded-2xl transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={creditos > 0 ? "Describe lo que quieres crear..." : "Sin créditos — compra más para continuar"}
                rows={1}
                className="w-full bg-transparent text-white placeholder-zinc-600 text-sm px-4 pt-3.5 pb-2 resize-none outline-none leading-relaxed"
                style={{ maxHeight: "200px" }}
                disabled={isGenerating || creditos <= 0}
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <span className="text-xs" style={{ color: "#3f3f46" }}>
                  {creditos > 0 ? `${COSTO_POR_GENERACION} crédito` : "Sin créditos"}
                </span>
                {isGenerating ? (
                  <button onClick={handleStop}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <X size={13} style={{ color: "#f87171" }} />
                  </button>
                ) : creditos <= 0 ? (
                  <button onClick={() => setShowModalCreditos(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: "rgba(255,215,0,0.15)", border: "1px solid rgba(255,215,0,0.3)", color: "#ffd700" }}>
                    <CreditCard size={11} /> Comprar
                  </button>
                ) : (
                  <button onClick={handleGenerate} disabled={!input.trim()}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: input.trim() ? "linear-gradient(135deg,#b8860b,#ffd700)" : "rgba(255,255,255,0.06)",
                      cursor: input.trim() ? "pointer" : "not-allowed",
                    }}>
                    <Send size={12} style={{ color: input.trim() ? "#000" : "#3f3f46" }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel derecho: Preview / Código ── */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#000" }}>

          {/* Tabs */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0 gap-2"
            style={{ borderColor: "#1a1a1a" }}>
            <div className="flex gap-1">
              {(["preview", "code"] as Tab[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeTab === tab ? "rgba(255,255,255,0.08)" : "transparent",
                    color: activeTab === tab ? "#fff" : "#52525b",
                    border: activeTab === tab ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  }}>
                  {tab === "preview" ? <Eye size={12} /> : <Code2 size={12} />}
                  {tab === "preview" ? "Vista" : "Código"}
                </button>
              ))}
            </div>

            {currentHtml && (
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: "#52525b", background: "transparent" }}>
                  {copied ? <Check size={11} style={{ color: "#22c55e" }} /> : <Copy size={11} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: "#52525b" }}>
                  <Download size={11} /> Descargar
                </button>
                <button onClick={() => setShowModalGitHub(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa" }}>
                  <GitBranch size={11} /> GitHub
                </button>
                <button onClick={() => setShowModalPublicar(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#000" }}>
                  <Globe size={11} /> Publicar
                </button>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden">
            {!currentHtml ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Moon size={24} style={{ color: "#27272a" }} />
                </div>
                <h2 className="text-base font-semibold mb-2" style={{ color: "#3f3f46" }}>Tu resultado aparecerá aquí</h2>
                <p className="text-xs max-w-xs leading-relaxed" style={{ color: "#27272a" }}>
                  Escribe en el chat y la IA construirá tu proyecto en tiempo real.
                </p>
              </div>
            ) : activeTab === "preview" ? (
              <div className="h-full overflow-auto p-6" style={{ background: "#000" }}>
                <div
                  className="prose prose-invert max-w-none"
                  style={{ color: "#d4d4d4", fontFamily: "Georgia, 'Times New Roman', serif", lineHeight: "1.9", fontSize: "15px" }}
                  dangerouslySetInnerHTML={{
                    __html: currentHtml
                      .replace(/<style[\s\S]*?<\/style>/gi, "")
                      .replace(/<script[\s\S]*?<\/script>/gi, "")
                      .replace(/<html[^>]*>|<\/html>|<head[\s\S]*?<\/head>|<body[^>]*>|<\/body>/gi, "")
                      .replace(/background[^;:]*:[^;]*/gi, "")
                      .replace(/color\s*:\s*[^;]*/gi, "")
                  }}
                />
              </div>
            ) : (
              <div className="h-full overflow-auto" style={{ background: "#000" }}>
                <pre className="p-5 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words" style={{ color: "#52525b" }}>
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
      {showModalPublicar && currentHtml && <ModalPublicar html={currentHtml} titulo={messages.find(m => m.role === "user")?.content?.slice(0, 40)} onClose={() => setShowModalPublicar(false)} />}
      {showPlantillas && <Plantillas onSelectPlantilla={(prompt) => { setInput(prompt); setShowExamples(false); }} onClose={() => setShowPlantillas(false)} />}

      <PWAInstall />
    </div>
  );
}
