"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Lock, Unlock, Save, Plus, Trash2, Zap, CreditCard,
  Users, BarChart3, ArrowLeft, Check, X,
  Edit3, RefreshCw, Eye, EyeOff, Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  nombre: string;
  creditos: number;
  precio: number;
  popular?: boolean;
  descripcion: string;
}

interface ManualCredit {
  userId: string;
  creditos: number;
  nota: string;
}

const DEFAULT_PLANES: Plan[] = [
  { id: "starter", nombre: "Starter", creditos: 10, precio: 99, descripcion: "Ideal para probar Nexa One Life" },
  { id: "pro", nombre: "Pro", creditos: 50, precio: 285, popular: true, descripcion: "Para proyectos frecuentes" },
  { id: "business", nombre: "Business", creditos: 100, precio: 570, descripcion: "Para uso intensivo y equipos" },
];

const goldBtnStyle = { background: "linear-gradient(135deg,#b8860b,#ffd700)", color: "#000" };
const cardStyle = { background: "#0a0a0a", border: "1px solid rgba(255,215,0,0.12)" };
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7" };
const goldIconStyle = { color: "#ffd700" };

export default function AdminPage() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [planes, setPlanes] = useState<Plan[]>(DEFAULT_PLANES);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  const [manualCredit, setManualCredit] = useState<ManualCredit>({ userId: "", creditos: 0, nota: "" });
  const [creditMsg, setCreditMsg] = useState("");
  const [creditHistory, setCreditHistory] = useState<Array<{ userId: string; creditos: number; nota: string; fecha: string }>>([]);

  const [activeTab, setActiveTab] = useState<"planes" | "creditos" | "stats">("planes");

  useEffect(() => {
    const savedPlanes = localStorage.getItem("nexaonelife_admin_planes");
    if (savedPlanes) setPlanes(JSON.parse(savedPlanes));
    const savedHistory = localStorage.getItem("nexaonelife_credit_history");
    if (savedHistory) setCreditHistory(JSON.parse(savedHistory));
    const isAuth = sessionStorage.getItem("nexaonelife_admin_auth");
    if (isAuth === "true") setAutenticado(true);
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setAutenticado(true);
      sessionStorage.setItem("nexaonelife_admin_auth", "true");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Contraseña incorrecta");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSavePlanes = () => {
    localStorage.setItem("nexaonelife_admin_planes", JSON.stringify(planes));
    localStorage.setItem("nexaonelife_planes_override", JSON.stringify(planes));
    setSavedMsg("Planes guardados correctamente");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleEditPlan = (plan: Plan) => setEditingPlan({ ...plan });

  const handleSaveEditPlan = () => {
    if (!editingPlan) return;
    setPlanes((prev) => prev.map((p) => (p.id === editingPlan.id ? editingPlan : p)));
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    const newPlan: Plan = { id: `plan_${Date.now()}`, nombre: "Nuevo Plan", creditos: 20, precio: 199, descripcion: "Descripción del plan" };
    setPlanes((prev) => [...prev, newPlan]);
    setEditingPlan(newPlan);
  };

  const handleDeletePlan = (id: string) => setPlanes((prev) => prev.filter((p) => p.id !== id));
  const handleSetPopular = (id: string) => setPlanes((prev) => prev.map((p) => ({ ...p, popular: p.id === id })));

  const handleAsignarCreditos = () => {
    if (!manualCredit.userId.trim() || manualCredit.creditos <= 0) {
      setCreditMsg("Ingresa un ID de usuario y cantidad válida");
      return;
    }
    const entry = { ...manualCredit, fecha: new Date().toLocaleString("es-MX") };
    const newHistory = [entry, ...creditHistory].slice(0, 50);
    setCreditHistory(newHistory);
    localStorage.setItem("nexaonelife_credit_history", JSON.stringify(newHistory));
    const userStore = localStorage.getItem("nexaonelife-user");
    if (userStore) {
      try {
        const parsed = JSON.parse(userStore);
        parsed.state.creditos = (parsed.state.creditos || 0) + manualCredit.creditos;
        localStorage.setItem("nexaonelife-user", JSON.stringify(parsed));
      } catch {}
    }
    setCreditMsg(`${manualCredit.creditos} créditos asignados a "${manualCredit.userId}"`);
    setManualCredit({ userId: "", creditos: 0, nota: "" });
    setTimeout(() => setCreditMsg(""), 4000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("nexaonelife_admin_auth");
    setAutenticado(false);
    setPassword("");
  };

  // ── Login ──
  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#000" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Nexa One Life" width={72} height={72} className="mx-auto mb-4 rounded-2xl" />
            <h1 className="text-2xl font-black text-white">Panel Admin</h1>
            <p className="text-sm mt-1" style={{ color: "#888" }}>Nexa One Life — Acceso restringido</p>
          </div>

          <div className="rounded-2xl p-6" style={{ ...cardStyle, boxShadow: "0 0 60px rgba(255,215,0,0.05)" }}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#ccc" }}>Correo de administrador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="admin@nexaoneia.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
                style={inputStyle}
              />
              <label className="block text-sm font-semibold mb-2" style={{ color: "#ccc" }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-10"
                  style={inputStyle}
                />
                <button onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#666" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading || !password}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-50 font-bold py-3 rounded-xl transition-all"
              style={goldBtnStyle}
            >
              {loginLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
              {loginLoading ? "Verificando..." : "Entrar al panel"}
            </button>
          </div>

          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 mx-auto mt-4 text-sm transition-colors" style={{ color: "#666" }}>
            <ArrowLeft size={14} /> Volver a Nexa One Life
          </button>
        </div>
      </div>
    );
  }

  // ── Panel Admin ──
  return (
    <div className="min-h-screen text-white" style={{ background: "#000" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ background: "#000", borderBottom: "1px solid rgba(255,215,0,0.08)" }}>
        <div className="flex items-center gap-3">
          <Image src="/logo-sm.png" alt="Nexa One Life" width={32} height={32} className="rounded-xl" />
          <div>
            <span className="font-black text-white">Panel Admin</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full" style={{ color: "#ffd700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Unlock size={10} className="inline mr-1" />Autorizado
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all" style={{ color: "#888" }}>
            <ArrowLeft size={14} /> App
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all" style={{ color: "#f87171" }}>
            <Lock size={14} /> Salir
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-2xl w-fit" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)" }}>
          {([
            { id: "planes" as const, label: "Planes y Precios", icon: CreditCard },
            { id: "creditos" as const, label: "Créditos Manuales", icon: Gift },
            { id: "stats" as const, label: "Estadísticas", icon: BarChart3 },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === id ? goldBtnStyle : { color: "#888" }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Planes ── */}
        {activeTab === "planes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Planes de Créditos</h2>
                <p className="text-sm mt-0.5" style={{ color: "#888" }}>Edita precios, créditos y descripciones</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddPlan} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#ccc" }}>
                  <Plus size={15} /> Nuevo plan
                </button>
                <button onClick={handleSavePlanes} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all" style={goldBtnStyle}>
                  <Save size={15} /> Guardar cambios
                </button>
              </div>
            </div>

            {savedMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                <Check size={15} /> {savedMsg}
              </div>
            )}

            <div className="grid gap-4">
              {planes.map((plan) => (
                <div key={plan.id} className="rounded-2xl p-5 transition-all" style={{ ...cardStyle, borderColor: plan.popular ? "rgba(255,215,0,0.3)" : "rgba(255,255,255,0.06)" }}>
                  {editingPlan?.id === plan.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>Nombre del plan</label>
                          <input value={editingPlan.nombre} onChange={(e) => setEditingPlan({ ...editingPlan, nombre: e.target.value })} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>Descripción</label>
                          <input value={editingPlan.descripcion} onChange={(e) => setEditingPlan({ ...editingPlan, descripcion: e.target.value })} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputStyle} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>Créditos incluidos</label>
                          <div className="relative">
                            <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={goldIconStyle} />
                            <input type="number" min={1} value={editingPlan.creditos} onChange={(e) => setEditingPlan({ ...editingPlan, creditos: parseInt(e.target.value) || 0 })} className="w-full rounded-xl pl-8 pr-3 py-2.5 text-sm outline-none" style={inputStyle} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5" style={{ color: "#888" }}>Precio (MXN)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#888" }}>$</span>
                            <input type="number" min={1} value={editingPlan.precio} onChange={(e) => setEditingPlan({ ...editingPlan, precio: parseInt(e.target.value) || 0 })} className="w-full rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none" style={inputStyle} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!editingPlan.popular} onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })} className="w-4 h-4 rounded" style={{ accentColor: "#ffd700" }} />
                          <span className="text-sm" style={{ color: "#ccc" }}>Marcar como popular</span>
                        </label>
                        <div className="ml-auto flex gap-2">
                          <button onClick={() => setEditingPlan(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all" style={{ background: "rgba(255,255,255,0.04)", color: "#ccc" }}>
                            <X size={13} /> Cancelar
                          </button>
                          <button onClick={handleSaveEditPlan} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all" style={goldBtnStyle}>
                            <Check size={13} /> Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}>
                          <Zap size={20} style={goldIconStyle} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{plan.nombre}</span>
                            {plan.popular && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,215,0,0.15)", color: "#ffd700" }}>Popular</span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: "#888" }}>{plan.descripcion}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm font-semibold" style={{ color: "#ffd700" }}>{plan.creditos} créditos</span>
                            <span style={{ color: "#333" }}>·</span>
                            <span className="text-sm font-bold" style={{ color: "#4ade80" }}>${plan.precio} MXN</span>
                            <span style={{ color: "#333" }}>·</span>
                            <span className="text-xs" style={{ color: "#666" }}>${(plan.precio / plan.creditos).toFixed(2)}/crédito</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSetPopular(plan.id)} className="px-2.5 py-1.5 rounded-lg text-xs transition-all" style={plan.popular ? { background: "rgba(255,215,0,0.08)", color: "#ffd700", border: "1px solid rgba(255,215,0,0.2)" } : { color: "#666" }}>
                          ★
                        </button>
                        <button onClick={() => handleEditPlan(plan)} className="p-2 rounded-xl transition-all" style={{ color: "#888" }}>
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="p-2 rounded-xl transition-all" style={{ color: "#666" }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#666" }}>
              <strong style={{ color: "#888" }}>Nota:</strong> Los cambios se guardan en el navegador. Para permanencia en producción, conecta una base de datos.
            </div>
          </div>
        )}

        {/* ── Tab: Créditos Manuales ── */}
        {activeTab === "creditos" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Asignar Créditos Manualmente</h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>Agrega créditos a cualquier usuario sin necesidad de pago</p>
            </div>

            <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#ccc" }}>ID o correo del usuario</label>
                  <input value={manualCredit.userId} onChange={(e) => setManualCredit({ ...manualCredit, userId: e.target.value })} placeholder="usuario@correo.com o ID" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#ccc" }}>Cantidad de créditos</label>
                  <div className="relative">
                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={goldIconStyle} />
                    <input type="number" min={1} value={manualCredit.creditos || ""} onChange={(e) => setManualCredit({ ...manualCredit, creditos: parseInt(e.target.value) || 0 })} placeholder="10" className="w-full rounded-xl pl-8 pr-4 py-3 text-sm outline-none" style={inputStyle} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#ccc" }}>Nota (opcional)</label>
                <input value={manualCredit.nota} onChange={(e) => setManualCredit({ ...manualCredit, nota: e.target.value })} placeholder="Ej: Compensación, regalo de bienvenida..." className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={inputStyle} />
              </div>

              {creditMsg && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                  {creditMsg}
                </div>
              )}

              <button onClick={handleAsignarCreditos} className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all" style={goldBtnStyle}>
                <Gift size={16} /> Asignar créditos
              </button>
            </div>

            {creditHistory.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-white mb-3">Historial de asignaciones</h3>
                <div className="space-y-2">
                  {creditHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3" style={cardStyle}>
                      <div>
                        <span className="text-sm font-semibold text-white">{entry.userId}</span>
                        {entry.nota && <span className="text-xs ml-2" style={{ color: "#666" }}>— {entry.nota}</span>}
                        <div className="text-xs mt-0.5" style={{ color: "#444" }}>{entry.fecha}</div>
                      </div>
                      <div className="flex items-center gap-1 font-bold" style={{ color: "#ffd700" }}>
                        <Zap size={13} />
                        +{entry.creditos}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Estadísticas ── */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Estadísticas</h2>
              <p className="text-sm mt-0.5" style={{ color: "#888" }}>Resumen de actividad de Nexa One Life</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Créditos asignados", value: creditHistory.reduce((a, b) => a + b.creditos, 0), icon: Gift, color: "#ffd700" },
                { label: "Asignaciones", value: creditHistory.length, icon: Users, color: "#60a5fa" },
                { label: "Planes activos", value: planes.length, icon: CreditCard, color: "#4ade80" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl p-5" style={{ ...cardStyle, borderColor: `${color}15` }}>
                  <Icon size={22} style={{ color }} className="mb-3" />
                  <div className="text-3xl font-black" style={{ color }}>{value}</div>
                  <div className="text-sm mt-1" style={{ color: "#888" }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5" style={cardStyle}>
              <h3 className="font-bold text-white mb-4">Planes configurados</h3>
              <div className="space-y-3">
                {planes.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{plan.nombre}</span>
                      {plan.popular && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,215,0,0.1)", color: "#ffd700" }}>Popular</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: "#ffd700" }}>{plan.creditos} créditos</span>
                      <span className="font-bold" style={{ color: "#4ade80" }}>${plan.precio} MXN</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", color: "#666" }}>
              Para estadísticas avanzadas (ventas reales, usuarios activos) se requiere conectar una base de datos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
