"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Send, Sparkles, Code2, Eye, Download, Trash2, Copy, Check,
  X, Loader2, GitBranch, CreditCard, TriangleAlert, Globe,
  Settings, ArrowRight, Clock, FolderOpen, Maximize2, Minimize2,
  RefreshCw, Monitor, Smartphone, Tablet, ZoomIn, ZoomOut,
  Wand2, Layers, Brain, Cpu, Paintbrush, CheckCircle2,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import { calcularCosto, NIVEL_COLORS } from "@/lib/creditos";
import { ModalCreditos } from "@/components/ModalCreditos";
import { ModalGitHub } from "@/components/ModalGitHub";
import { PWAInstall } from "@/components/PWAInstall";
import { Sugerencias } from "@/components/Sugerencias";
import { ModalPublicar } from "@/components/ModalPublicar";
import { Plantillas } from "@/components/Plantillas";
import { HistorialVersiones } from "@/components/HistorialVersiones";
import { MisProyectos } from "@/components/MisProyectos";

type Message = { role: "user" | "assistant"; content: string };
type Tab = "preview" | "code";
type ViewMode = "split" | "full-preview" | "full-chat";
type Device = "desktop" | "tablet" | "mobile";

// Colores premium
const C = {
  purple: "#7c3aed",
  purpleLight: "#a78bfa",
  purpleDim: "rgba(124,58,237,0.15)",
  purpleBorder: "rgba(124,58,237,0.25)",
  cyan: "#06b6d4",
  cyanDim: "rgba(6,182,212,0.12)",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  green: "#22c55e",
  red: "#ef4444",
  bg: "#000000",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  text: "#e4e4e7",
  muted: "#71717a",
  dim: "#3f3f46",
};

const GRAD_PRIMARY = "linear-gradient(135deg, #7c3aed, #06b6d4)";
const GRAD_ACCENT  = "linear-gradient(135deg, #7c3aed, #a78bfa)";
const GRAD_AMBER   = "linear-gradient(135deg, #f59e0b, #fbbf24)";

const EXAMPLE_PROMPTS = [
  "Crea un menú digital para restaurante con categorías y WhatsApp",
  "Haz un sistema de citas para consultorio médico",
  "Diseña una landing page para despacho de abogados",
  "Crea un catálogo de propiedades inmobiliarias",
  "Haz un dashboard de ventas con gráficas y KPIs",
  "Diseña una app de farmacia con inventario y ventas",
];

const DEVICE_SIZES = {
  desktop: { label: "Escritorio", icon: <Monitor size={13} />, width: "100%" },
  tablet:  { label: "Tablet",     icon: <Tablet size={13} />,  width: "768px" },
  mobile:  { label: "Móvil",      icon: <Smartphone size={13} />, width: "390px" },
};

interface ThinkingStep {
  id: string;
  icon: React.ReactNode;
  label: string;
  status: "pending" | "active" | "done";
}

function getThinkingSteps(prompt: string): Omit<ThinkingStep, "status">[] {
  const lower = prompt.toLowerCase();
  const steps: Omit<ThinkingStep, "status">[] = [
    { id: "analizar", icon: <Brain size={11} />, label: "Analizando tu idea..." },
    { id: "disenar",  icon: <Paintbrush size={11} />, label: "Diseñando la estructura..." },
    { id: "generar",  icon: <Cpu size={11} />, label: "Generando el código..." },
    { id: "optimizar",icon: <Wand2 size={11} />, label: "Optimizando la interfaz..." },
    { id: "finalizar",icon: <Layers size={11} />, label: "Finalizando detalles..." },
  ];
  if (lower.includes("dashboard") || lower.includes("panel")) {
    steps[2] = { id: "generar", icon: <Cpu size={11} />, label: "Construyendo gráficas y KPIs..." };
  } else if (lower.includes("tienda") || lower.includes("ecommerce")) {
    steps[2] = { id: "generar", icon: <Cpu size={11} />, label: "Creando carrito y productos..." };
  } else if (lower.includes("restaurante") || lower.includes("menú") || lower.includes("menu")) {
    steps[2] = { id: "generar", icon: <Cpu size={11} />, label: "Agregando platillos y precios..." };
  }
  return steps;
}

function ThinkingPanel({ steps, currentStep }: { steps: Omit<ThinkingStep,"status">[]; currentStep: number }) {
  return (
    <div className="rounded-xl p-3 space-y-1.5" style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}` }}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.purple }} />
        <span className="text-xs font-bold" style={{ color: C.purpleLight }}>IA trabajando</span>
      </div>
      {steps.map((step, i) => {
        const isDone   = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: isDone ? "rgba(34,197,94,0.15)" : isActive ? C.purpleDim : "transparent" }}>
              {isDone
                ? <CheckCircle2 size={10} style={{ color: C.green }} />
                : isActive
                  ? <Loader2 size={10} className="animate-spin" style={{ color: C.purple }} />
                  : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#27272a" }} />}
            </div>
            <span className="text-xs" style={{ color: isDone ? C.green : isActive ? C.purpleLight : C.dim, fontWeight: isActive ? 600 : 400 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function selectModel(prompt: string): "openai" | "claude" {
  const lower = prompt.toLowerCase();
  const complex = ["dashboard","sistema","crm","erp","ecommerce","tienda","inventario","complejo","avanzado","profesional","empresa","negocio","analytics","base de datos","autenticación","multi","plataforma","saas","contador","abogado","arquitecto","bienes raíces"];
  return (complex.some((k) => lower.includes(k)) || prompt.length > 200) ? "claude" : "openai";
}

function generarNombreProyecto(prompt: string): string {
  const words = prompt.trim().split(" ").slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function extractHtml(text: string): string {
  const match = text.match(/```html\s*([\s\S]*?)```/);
  if (match) return match[1].trim();
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) return text.trim();
  return "";
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
  const [showHistorial, setShowHistorial] = useState(false);
  const [showProyectos, setShowProyectos] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [device, setDevice] = useState<Device>("desktop");
  const [zoom, setZoom] = useState(100);
  const [iframeKey, setIframeKey] = useState(0);
  const [thinkingSteps, setThinkingSteps] = useState<Omit<ThinkingStep,"status">[]>([]);
  const [thinkingStep, setThinkingStep] = useState(0);
  const thinkingInterval = useRef<NodeJS.Timeout | null>(null);

  const {
    creditos, consumirCredito, incrementarGeneraciones,
    proyectos, proyectoActualId,
    crearProyecto, actualizarProyecto, eliminarProyecto,
    setProyectoActual, restaurarVersion,
  } = useUserStore();

  const proyectoActual = proyectos.find((p) => p.id === proyectoActualId) ?? null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const abortRef    = useRef<AbortController | null>(null);

  const costoActual = useMemo(() => {
    if (!input.trim()) return null;
    return calcularCosto(input.trim(), !!proyectoActualId);
  }, [input, proyectoActualId]);

  const costoColors = costoActual ? NIVEL_COLORS[costoActual.nivel] : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isGenerating]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  };

  const startThinking = useCallback((prompt: string) => {
    const steps = getThinkingSteps(prompt);
    setThinkingSteps(steps);
    setThinkingStep(0);
    let step = 0;
    thinkingInterval.current = setInterval(() => {
      step++;
      if (step < steps.length) setThinkingStep(step);
      else if (thinkingInterval.current) clearInterval(thinkingInterval.current);
    }, 1800);
  }, []);

  const stopThinking = useCallback(() => {
    if (thinkingInterval.current) clearInterval(thinkingInterval.current);
    setThinkingStep(99);
  }, []);

  const handleGenerate = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isGenerating) return;

    const costo = calcularCosto(prompt, !!proyectoActualId);
    if (creditos < costo.creditos) { setNoCreditos(true); return; }

    for (let i = 0; i < costo.creditos; i++) consumirCredito();
    setInput("");
    setShowExamples(false);
    setNoCreditos(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newMessages: Message[] = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setIsGenerating(true);
    setStreamingText("");
    startThinking(prompt);

    const autoModel = selectModel(prompt);
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model: autoModel }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Error del servidor"); }

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
        if (html) { setCurrentHtml(html); setActiveTab("preview"); setIframeKey((k) => k + 1); }
      }

      stopThinking();
      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamingText("");
      incrementarGeneraciones();

      const finalHtml = extractHtml(fullText);
      if (finalHtml) {
        setCurrentHtml(finalHtml);
        setActiveTab("preview");
        setIframeKey((k) => k + 1);
        if (proyectoActualId) actualizarProyecto(proyectoActualId, finalHtml, prompt);
        else crearProyecto(generarNombreProyecto(prompt), finalHtml, prompt);
      }
    } catch (err: unknown) {
      stopThinking();
      if (err instanceof Error && err.name === "AbortError") return;
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ **Error:** ${errorMsg}` }]);
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [input, messages, isGenerating, creditos, consumirCredito, incrementarGeneraciones, proyectoActualId, crearProyecto, actualizarProyecto, startThinking, stopThinking]);

  const handleStop = () => { abortRef.current?.abort(); stopThinking(); setIsGenerating(false); setStreamingText(""); };

  const handleCopy = async () => {
    if (!currentHtml) return;
    await navigator.clipboard.writeText(currentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentHtml) return;
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${proyectoActual?.nombre ?? "nexaonelife"}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMessages([]); setCurrentHtml(""); setStreamingText("");
    setShowExamples(true); setNoCreditos(false);
    setProyectoActual(null); setThinkingSteps([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
  };

  const handleAbrirProyecto = (proyecto: typeof proyectos[0]) => {
    setCurrentHtml(proyecto.html); setProyectoActual(proyecto.id);
    setShowExamples(false); setActiveTab("preview");
    setIframeKey((k) => k + 1); setShowProyectos(false); setMessages([]);
  };

  const handleRestaurarVersion = (version: { id: string; html: string; prompt: string; timestamp: number; label: string }) => {
    if (!proyectoActualId) return;
    restaurarVersion(proyectoActualId, version.id);
    setCurrentHtml(version.html); setIframeKey((k) => k + 1); setShowHistorial(false);
  };

  const showChat    = viewMode === "split" || viewMode === "full-chat";
  const showPreview = viewMode === "split" || viewMode === "full-preview";

  return (
    <div className="flex flex-col h-screen overflow-hidden app-bg">

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ background: "rgba(0,0,0,0.9)", borderBottom: `1px solid ${C.purpleBorder}`, backdropFilter: "blur(20px)", zIndex: 10 }}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: GRAD_PRIMARY, boxShadow: "0 0 16px rgba(124,58,237,0.5)" }}>
              <Image src="/logo-sm.png" alt="Nexa One Life" width={20} height={20} className="rounded-lg" priority />
            </div>
            <div className="flex items-baseline gap-0.5">
              {[
                ["Nexa", "linear-gradient(90deg,#a78bfa,#7c3aed)"],
                ["One",  "linear-gradient(90deg,#06b6d4,#0891b2)"],
                ["Life", "linear-gradient(90deg,#f59e0b,#fbbf24)"],
              ].map(([word, grad]) => (
                <span key={word} className="font-black text-sm tracking-tight"
                  style={{ background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {word}
                </span>
              ))}
            </div>
          </div>
          {proyectoActual && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
              <span className="text-xs font-medium truncate max-w-[140px]" style={{ color: C.purpleLight }}>
                {proyectoActual.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Acciones header */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowProyectos(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>
            <FolderOpen size={11} />
            Proyectos
            {proyectos.length > 0 && (
              <span className="text-xs px-1 rounded" style={{ background: C.purpleDim, color: C.purpleLight }}>
                {proyectos.length}
              </span>
            )}
          </button>

          {proyectoActual && proyectoActual.versions.length > 1 && (
            <button onClick={() => setShowHistorial(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>
              <Clock size={11} />
              <span className="hidden sm:inline">v{proyectoActual.versions.length}</span>
            </button>
          )}

          {/* Créditos */}
          <button onClick={() => setShowModalCreditos(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: creditos <= 2 ? "rgba(239,68,68,0.1)" : C.purpleDim,
              border: `1px solid ${creditos <= 2 ? "rgba(239,68,68,0.3)" : C.purpleBorder}`,
              color: creditos <= 2 ? "#f87171" : C.purpleLight,
            }}>
            <Sparkles size={11} />
            {creditos} créditos
            {creditos <= 2 && <TriangleAlert size={10} />}
          </button>

          <a href="/admin" className="p-2 rounded-lg transition-all"
            style={{ color: C.dim, background: C.surface, border: `1px solid ${C.border}` }}>
            <Settings size={13} />
          </a>

          {messages.length > 0 && (
            <button onClick={handleClear} className="p-2 rounded-lg transition-all" style={{ color: C.dim }}>
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </header>

      {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── PANEL CHAT ─────────────────────────────────────────────────── */}
        {showChat && (
          <div className={`flex flex-col shrink-0 ${viewMode === "full-chat" ? "w-full" : "w-full md:w-[360px] lg:w-[400px]"}`}
            style={{ background: "#000", borderRight: `1px solid ${C.purpleBorder}` }}>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

              {/* Estado vacío */}
              {messages.length === 0 && showExamples && (
                <div className="fade-in space-y-5">
                  <div className="text-center pt-4">
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center purple-glow"
                      style={{ background: GRAD_PRIMARY, boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
                      <Wand2 size={24} style={{ color: "#fff" }} />
                    </div>
                    <h1 className="text-base font-black text-white mb-1">¿Qué quieres crear hoy?</h1>
                    <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: C.dim }}>
                      Describe tu idea y la IA la construirá en segundos.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {EXAMPLE_PROMPTS.map((ex) => (
                      <button key={ex}
                        onClick={() => { setInput(ex); textareaRef.current?.focus(); }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all group flex items-center justify-between"
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.dim }}>
                        <span className="group-hover:text-white transition-colors leading-relaxed">{ex}</span>
                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
                          style={{ color: C.purple }} />
                      </button>
                    ))}
                  </div>

                  <button onClick={() => setShowPlantillas(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all"
                    style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, color: C.purpleLight }}>
                    <Layers size={12} /> Ver todas las plantillas de negocios
                  </button>
                </div>
              )}

              {/* Mensajes */}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 fade-in ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      background: msg.role === "user" ? GRAD_PRIMARY : C.surface,
                      color: msg.role === "user" ? "#fff" : C.muted,
                    }}>
                    {msg.role === "user" ? "T" : <Sparkles size={10} />}
                  </div>
                  <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                    style={{
                      background: msg.role === "user" ? C.purpleDim : C.surface,
                      border: `1px solid ${msg.role === "user" ? C.purpleBorder : C.border}`,
                      color: msg.role === "user" ? C.purpleLight : C.muted,
                      borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    }}>
                    {msg.role === "assistant" && extractHtml(msg.content) ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: C.green }}>
                          <CheckCircle2 size={11} />
                          <span className="font-semibold">Listo — ver en el preview</span>
                        </div>
                        <button onClick={() => { setActiveTab("preview"); if (viewMode === "full-chat") setViewMode("split"); }}
                          className="text-xs flex items-center gap-1 transition-colors mt-1"
                          style={{ color: C.cyan }}>
                          <Eye size={10} /> Ver resultado →
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Pensamiento IA */}
              {isGenerating && thinkingSteps.length > 0 && (
                <div className="fade-in">
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}` }}>
                      <Brain size={10} style={{ color: C.purple }} />
                    </div>
                    <div className="flex-1">
                      <ThinkingPanel steps={thinkingSteps} currentStep={thinkingStep} />
                      {currentHtml && (
                        <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: C.cyan }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.cyan }} />
                          Preview actualizándose en vivo...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming */}
              {isGenerating && streamingText && !extractHtml(streamingText) && (
                <div className="flex gap-2.5 fade-in">
                  <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                    style={{ background: C.surface }}>
                    <Sparkles size={10} style={{ color: C.purple }} />
                  </div>
                  <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: "4px 16px 16px 16px" }}>
                    <p className="whitespace-pre-wrap typing-cursor">{streamingText}</p>
                  </div>
                </div>
              )}

              {/* Sin créditos */}
              {noCreditos && (
                <div className="rounded-2xl p-4 text-center fade-in"
                  style={{ background: "rgba(127,29,29,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <TriangleAlert size={18} className="mx-auto mb-2" style={{ color: "#f87171" }} />
                  <p className="font-bold text-sm mb-1" style={{ color: "#fca5a5" }}>Créditos insuficientes</p>
                  <p className="text-xs mb-3" style={{ color: C.dim }}>
                    {costoActual ? `Esta tarea requiere ${costoActual.creditos} créditos. Tienes ${creditos}.` : "Necesitas más créditos."}
                  </p>
                  <button onClick={() => setShowModalCreditos(true)}
                    className="flex items-center gap-1.5 mx-auto text-xs font-bold px-4 py-2 rounded-xl"
                    style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, color: C.purpleLight }}>
                    <CreditCard size={11} /> Comprar créditos
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Sugerencias */}
            {currentHtml && !isGenerating && (
              <Sugerencias html={currentHtml} onSugerencia={(texto) => { setInput(texto); textareaRef.current?.focus(); }} />
            )}

            {/* ── INPUT ── */}
            <div className="p-3 border-t shrink-0" style={{ borderColor: C.purpleBorder }}>
              <div className="rounded-2xl overflow-hidden transition-all"
                style={{
                  background: "rgba(124,58,237,0.04)",
                  border: `1px solid ${costoActual && input.trim() ? costoColors!.border : C.purpleBorder}`,
                  boxShadow: costoActual && input.trim() ? `0 0 0 1px ${costoColors!.border}` : "none",
                }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={creditos > 0 ? "Describe lo que quieres crear..." : "Sin créditos — compra más para continuar"}
                  rows={1}
                  className="w-full bg-transparent text-white placeholder-zinc-700 text-sm px-4 pt-3.5 pb-1 resize-none outline-none leading-relaxed"
                  style={{ maxHeight: "180px" }}
                  disabled={isGenerating || creditos <= 0}
                />

                <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    {costoActual && input.trim() ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all"
                        style={{ background: costoColors!.bg, border: `1px solid ${costoColors!.border}`, color: costoColors!.color }}>
                        <Sparkles size={9} />
                        {costoActual.creditos} {costoActual.creditos === 1 ? "crédito" : "créditos"}
                        <span className="opacity-60 font-normal">· {costoActual.descripcion}</span>
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: "#1a1a1a" }}>
                        {creditos > 0 ? "Enter para generar" : "Sin créditos"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setShowPlantillas(true)}
                      className="p-1.5 rounded-lg transition-all text-xs"
                      style={{ color: C.dim }} title="Plantillas">
                      <Layers size={13} />
                    </button>

                    {isGenerating ? (
                      <button onClick={handleStop}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <X size={12} style={{ color: "#f87171" }} />
                      </button>
                    ) : creditos <= 0 ? (
                      <button onClick={() => setShowModalCreditos(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, color: C.purpleLight }}>
                        <CreditCard size={10} /> Comprar
                      </button>
                    ) : (
                      <button onClick={handleGenerate} disabled={!input.trim() || isGenerating}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: input.trim() ? GRAD_PRIMARY : C.surface,
                          cursor: input.trim() ? "pointer" : "not-allowed",
                          opacity: input.trim() ? 1 : 0.4,
                          boxShadow: input.trim() ? "0 0 12px rgba(124,58,237,0.4)" : "none",
                        }}>
                        <Send size={12} style={{ color: input.trim() ? "#fff" : C.dim }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL PREVIEW ──────────────────────────────────────────────── */}
        {showPreview && (
          <div className="flex-1 flex flex-col overflow-hidden preview-bg">

            {/* Barra de herramientas del preview */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0 gap-3"
              style={{ background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${C.purpleBorder}`, backdropFilter: "blur(12px)" }}>

              {/* Izquierda: toggle + tabs */}
              <div className="flex items-center gap-1">
                <button onClick={() => setViewMode(viewMode === "full-preview" ? "split" : "full-preview")}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: C.dim }}
                  title={viewMode === "full-preview" ? "Vista dividida" : "Pantalla completa"}>
                  {viewMode === "full-preview" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>

                <div className="flex items-center rounded-lg p-0.5"
                  style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}` }}>
                  {(["preview", "code"] as Tab[]).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                      style={{
                        background: activeTab === tab ? C.purple : "transparent",
                        color: activeTab === tab ? "#fff" : C.dim,
                        boxShadow: activeTab === tab ? "0 0 8px rgba(124,58,237,0.4)" : "none",
                      }}>
                      {tab === "preview" ? <Eye size={11} /> : <Code2 size={11} />}
                      {tab === "preview" ? "Vista" : "Código"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Centro: dispositivos + zoom */}
              {activeTab === "preview" && currentHtml && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg p-0.5"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    {(["desktop","tablet","mobile"] as Device[]).map((d) => (
                      <button key={d} onClick={() => setDevice(d)}
                        className="p-1.5 rounded-md transition-all"
                        style={{
                          background: device === d ? C.purpleDim : "transparent",
                          color: device === d ? C.purple : C.dim,
                        }}
                        title={DEVICE_SIZES[d].label}>
                        {DEVICE_SIZES[d].icon}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 rounded-lg px-2 py-1"
                    style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <button onClick={() => setZoom(z => Math.max(25, z - 25))} style={{ color: C.dim }}>
                      <ZoomOut size={11} />
                    </button>
                    <span className="text-xs font-mono w-9 text-center" style={{ color: C.muted }}>{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(150, z + 25))} style={{ color: C.dim }}>
                      <ZoomIn size={11} />
                    </button>
                  </div>

                  <button onClick={() => setIframeKey(k => k + 1)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: C.dim }} title="Recargar">
                    <RefreshCw size={12} />
                  </button>
                </div>
              )}

              {/* Derecha: acciones */}
              {currentHtml && (
                <div className="flex items-center gap-1">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{ color: copied ? C.green : C.dim }}>
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{ color: C.dim }}>
                    <Download size={11} />
                    <span className="hidden sm:inline">Descargar</span>
                  </button>
                  <button onClick={() => setShowModalGitHub(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all"
                    style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>
                    <GitBranch size={11} />
                    <span className="hidden sm:inline">GitHub</span>
                  </button>
                  <button onClick={() => setShowModalPublicar(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: GRAD_PRIMARY, color: "#fff", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}>
                    <Globe size={11} /> Publicar
                  </button>
                </div>
              )}
            </div>

            {/* Área del preview */}
            <div className="flex-1 overflow-hidden relative flex items-start justify-center"
              style={{
                background: activeTab === "preview" && currentHtml ? "#111" : "#000",
                padding: activeTab === "preview" && currentHtml && device !== "desktop" ? "16px" : "0",
              }}>

              {!currentHtml ? (
                <div className="flex flex-col items-center justify-center h-full w-full text-center px-8">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
                    style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}` }}>
                    <Monitor size={32} style={{ color: C.purple }} />
                  </div>
                  <h2 className="text-sm font-semibold mb-2" style={{ color: C.muted }}>El preview aparecerá aquí</h2>
                  <p className="text-xs max-w-xs leading-relaxed" style={{ color: C.dim }}>
                    Escribe en el chat y verás tu proyecto construirse en tiempo real.
                  </p>
                  {viewMode === "split" && (
                    <button onClick={() => setViewMode("full-chat")}
                      className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, color: C.purpleLight }}>
                      <Wand2 size={12} /> Ir al chat
                    </button>
                  )}
                </div>
              ) : activeTab === "preview" ? (
                <div className="transition-all duration-300 overflow-hidden rounded-lg"
                  style={{
                    width: device === "desktop" ? "100%" : DEVICE_SIZES[device].width,
                    height: device === "desktop" ? "100%" : "calc(100% - 32px)",
                    maxWidth: "100%",
                    boxShadow: device !== "desktop" ? `0 0 0 1px ${C.purpleBorder}, 0 20px 60px rgba(0,0,0,0.8)` : "none",
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}>
                  {device !== "desktop" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg"
                      style={{ background: "#1a1a1a", borderBottom: "1px solid #222" }}>
                      <div className="flex gap-1">
                        {["#ff5f57","#ffbd2e","#28c840"].map(c => (
                          <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="flex-1 rounded-md px-2 py-1 text-xs text-center" style={{ background: "#111", color: C.dim }}>
                        preview.nexaoneia.com
                      </div>
                    </div>
                  )}
                  <iframe
                    key={iframeKey}
                    srcDoc={currentHtml}
                    className="w-full border-0"
                    style={{ height: device !== "desktop" ? "calc(100% - 36px)" : "100%", background: "#fff" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    title="Preview en vivo"
                  />
                </div>
              ) : (
                <div className="w-full h-full overflow-auto" style={{ background: "#000" }}>
                  <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0"
                    style={{ background: "#000", borderColor: C.purpleBorder }}>
                    <span className="text-xs font-mono" style={{ color: C.dim }}>index.html</span>
                    <span className="text-xs" style={{ color: "#1a1a1a" }}>{currentHtml.length.toLocaleString()} caracteres</span>
                  </div>
                  <pre className="p-5 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words" style={{ color: C.dim }}>
                    <code>{currentHtml}</code>
                  </pre>
                </div>
              )}

              {/* Indicador generación en vivo */}
              {isGenerating && currentHtml && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold fade-in"
                  style={{ background: "rgba(0,0,0,0.9)", border: `1px solid ${C.purpleBorder}`, color: C.purpleLight, backdropFilter: "blur(10px)" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.purple }} />
                  Construyendo en vivo...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALES ═════════════════════════════════════════════════════════ */}
      {showModalCreditos && <ModalCreditos onClose={() => setShowModalCreditos(false)} />}
      {showModalGitHub && currentHtml && <ModalGitHub html={currentHtml} onClose={() => setShowModalGitHub(false)} />}
      {showModalPublicar && currentHtml && (
        <ModalPublicar
          html={currentHtml}
          titulo={messages.find(m => m.role === "user")?.content?.slice(0, 40)}
          onClose={() => setShowModalPublicar(false)}
        />
      )}
      {showPlantillas && (
        <Plantillas
          onSelectPlantilla={(prompt) => { setInput(prompt); setShowExamples(false); setShowPlantillas(false); textareaRef.current?.focus(); }}
          onClose={() => setShowPlantillas(false)}
        />
      )}
      {showHistorial && proyectoActual && (
        <HistorialVersiones
          versions={proyectoActual.versions}
          currentHtml={currentHtml}
          onRestaurar={handleRestaurarVersion}
          onClose={() => setShowHistorial(false)}
        />
      )}
      {showProyectos && (
        <MisProyectos
          proyectos={proyectos}
          proyectoActualId={proyectoActualId}
          onAbrir={handleAbrirProyecto}
          onEliminar={eliminarProyecto}
          onNuevo={handleClear}
          onClose={() => setShowProyectos(false)}
        />
      )}
      <PWAInstall />
    </div>
  );
}
