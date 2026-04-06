"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Lock, Unlock, Save, Plus, Trash2, Zap, CreditCard,
  Users, BarChart3, Settings, ArrowLeft, Check, X,
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

interface AdminStats {
  totalGeneraciones: number;
  totalVentas: number;
  creditosVendidos: number;
  ultimaActualizacion: string;
}

const DEFAULT_PLANES: Plan[] = [
  { id: "starter", nombre: "Starter", creditos: 10, precio: 99, descripcion: "Ideal para probar Nexa One Life" },
  { id: "pro", nombre: "Pro", creditos: 50, precio: 285, popular: true, descripcion: "Para proyectos frecuentes" },
  { id: "business", nombre: "Business", creditos: 100, precio: 570, descripcion: "Para uso intensivo y equipos" },
];

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

  // Cargar datos guardados
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
    // También actualizar el store global para que la UI principal lo vea
    localStorage.setItem("nexaonelife_planes_override", JSON.stringify(planes));
    setSavedMsg("Planes guardados correctamente");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSaveEditPlan = () => {
    if (!editingPlan) return;
    setPlanes((prev) => prev.map((p) => (p.id === editingPlan.id ? editingPlan : p)));
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    const newPlan: Plan = {
      id: `plan_${Date.now()}`,
      nombre: "Nuevo Plan",
      creditos: 20,
      precio: 199,
      descripcion: "Descripción del plan",
    };
    setPlanes((prev) => [...prev, newPlan]);
    setEditingPlan(newPlan);
  };

  const handleDeletePlan = (id: string) => {
    setPlanes((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSetPopular = (id: string) => {
    setPlanes((prev) => prev.map((p) => ({ ...p, popular: p.id === id })));
  };

  const handleAsignarCreditos = () => {
    if (!manualCredit.userId.trim() || manualCredit.creditos <= 0) {
      setCreditMsg("Ingresa un ID de usuario y cantidad válida");
      return;
    }

    // Guardar en historial
    const entry = {
      ...manualCredit,
      fecha: new Date().toLocaleString("es-MX"),
    };
    const newHistory = [entry, ...creditHistory].slice(0, 50);
    setCreditHistory(newHistory);
    localStorage.setItem("nexaonelife_credit_history", JSON.stringify(newHistory));

    // Si el userId coincide con el usuario actual en localStorage
    const userStore = localStorage.getItem("nexaonelife-user");
    if (userStore) {
      try {
        const parsed = JSON.parse(userStore);
        // Agregar créditos al estado del store
        parsed.state.creditos = (parsed.state.creditos || 0) + manualCredit.creditos;
        localStorage.setItem("nexaonelife-user", JSON.stringify(parsed));
      } catch {}
    }

    setCreditMsg(`✅ ${manualCredit.creditos} créditos asignados a "${manualCredit.userId}"`);
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Nexa One Life" width={72} height={72} className="mx-auto mb-4 rounded-2xl" />
            <h1 className="text-2xl font-black text-white">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Nexa One Life — Acceso restringido</p>
          </div>

          <div className="bg-gray-900 rounded-3xl border border-gray-700 p-6 shadow-2xl">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Correo de administrador</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="abrahamreyesperez804@gmail.com"
                className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors mb-3"
              />
              <label className="block text-sm font-semibold text-gray-300 mb-2">Contraseña de administrador</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••••"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors pr-10"
                />
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 px-3 py-2.5 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
                {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading || !password}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loginLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
              {loginLoading ? "Verificando..." : "Entrar al panel"}
            </button>
          </div>

          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 mx-auto mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors">
            <ArrowLeft size={14} /> Volver a Nexa One Life
          </button>
        </div>
      </div>
    );
  }

  // ── Panel Admin ──
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Image src="/logo-sm.png" alt="Nexa One Life" width={32} height={32} className="rounded-xl" />
          <div>
            <span className="font-black text-white">Panel Admin</span>
            <span className="text-xs text-indigo-400 ml-2 bg-indigo-900/40 px-2 py-0.5 rounded-full border border-indigo-700/50">
              <Unlock size={10} className="inline mr-1" />Autorizado
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            <ArrowLeft size={14} /> App
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-all">
            <Lock size={14} /> Salir
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-1.5 rounded-2xl border border-gray-800 w-fit">
          {([
            { id: "planes", label: "Planes y Precios", icon: CreditCard },
            { id: "creditos", label: "Créditos Manuales", icon: Gift },
            { id: "stats", label: "Estadísticas", icon: BarChart3 },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
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
                <p className="text-gray-400 text-sm mt-0.5">Edita precios, créditos y descripciones de cada plan</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPlan}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-gray-300 transition-all"
                >
                  <Plus size={15} /> Nuevo plan
                </button>
                <button
                  onClick={handleSavePlanes}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Save size={15} /> Guardar cambios
                </button>
              </div>
            </div>

            {savedMsg && (
              <div className="flex items-center gap-2 px-4 py-3 bg-green-900/30 border border-green-700/50 rounded-xl text-green-300 text-sm">
                <Check size={15} /> {savedMsg}
              </div>
            )}

            <div className="grid gap-4">
              {planes.map((plan) => (
                <div key={plan.id} className={`bg-gray-900 rounded-2xl border p-5 transition-all ${plan.popular ? "border-indigo-500/60" : "border-gray-700"}`}>
                  {editingPlan?.id === plan.id ? (
                    /* Modo edición */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nombre del plan</label>
                          <input
                            value={editingPlan.nombre}
                            onChange={(e) => setEditingPlan({ ...editingPlan, nombre: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Descripción</label>
                          <input
                            value={editingPlan.descripcion}
                            onChange={(e) => setEditingPlan({ ...editingPlan, descripcion: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Créditos incluidos</label>
                          <div className="relative">
                            <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                            <input
                              type="number"
                              min={1}
                              value={editingPlan.creditos}
                              onChange={(e) => setEditingPlan({ ...editingPlan, creditos: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-2.5 text-white text-sm outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Precio (MXN)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              min={1}
                              value={editingPlan.precio}
                              onChange={(e) => setEditingPlan({ ...editingPlan, precio: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-7 pr-3 py-2.5 text-white text-sm outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!editingPlan.popular}
                            onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                            className="w-4 h-4 rounded accent-indigo-500"
                          />
                          <span className="text-sm text-gray-300">Marcar como popular</span>
                        </label>
                        <div className="ml-auto flex gap-2">
                          <button onClick={() => setEditingPlan(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-all">
                            <X size={13} /> Cancelar
                          </button>
                          <button onClick={handleSaveEditPlan} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-semibold transition-all">
                            <Check size={13} /> Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Modo vista */
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-center">
                          <Zap size={20} className="text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{plan.nombre}</span>
                            {plan.popular && (
                              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">Popular</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{plan.descripcion}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-indigo-300 text-sm font-semibold">{plan.creditos} créditos</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-green-400 text-sm font-bold">${plan.precio} MXN</span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500 text-xs">${(plan.precio / plan.creditos).toFixed(2)}/crédito</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSetPopular(plan.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${plan.popular ? "bg-indigo-900/50 text-indigo-400 border border-indigo-700/50" : "text-gray-500 hover:text-indigo-400 hover:bg-gray-800"}`}
                          title="Marcar como popular"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-sm text-gray-500">
              <strong className="text-gray-400">Nota:</strong> Los cambios se guardan en el navegador. Para que sean permanentes en producción, necesitarás una base de datos.
            </div>
          </div>
        )}

        {/* ── Tab: Créditos Manuales ── */}
        {activeTab === "creditos" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Asignar Créditos Manualmente</h2>
              <p className="text-gray-400 text-sm mt-0.5">Agrega créditos a cualquier usuario sin necesidad de pago</p>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">ID o correo del usuario</label>
                  <input
                    value={manualCredit.userId}
                    onChange={(e) => setManualCredit({ ...manualCredit, userId: e.target.value })}
                    placeholder="usuario@correo.com o ID"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Cantidad de créditos</label>
                  <div className="relative">
                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                    <input
                      type="number"
                      min={1}
                      value={manualCredit.creditos || ""}
                      onChange={(e) => setManualCredit({ ...manualCredit, creditos: parseInt(e.target.value) || 0 })}
                      placeholder="10"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl pl-8 pr-4 py-3 text-white text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Nota (opcional)</label>
                <input
                  value={manualCredit.nota}
                  onChange={(e) => setManualCredit({ ...manualCredit, nota: e.target.value })}
                  placeholder="Ej: Compensación por error, regalo de bienvenida..."
                  className="w-full bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                />
              </div>

              {creditMsg && (
                <div className={`px-4 py-3 rounded-xl text-sm border ${creditMsg.startsWith("✅") ? "bg-green-900/30 border-green-700/50 text-green-300" : "bg-red-900/30 border-red-700/50 text-red-300"}`}>
                  {creditMsg}
                </div>
              )}

              <button
                onClick={handleAsignarCreditos}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <Gift size={16} /> Asignar créditos
              </button>
            </div>

            {/* Historial */}
            {creditHistory.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-white mb-3">Historial de asignaciones</h3>
                <div className="space-y-2">
                  {creditHistory.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-white">{entry.userId}</span>
                        {entry.nota && <span className="text-xs text-gray-500 ml-2">— {entry.nota}</span>}
                        <div className="text-xs text-gray-600 mt-0.5">{entry.fecha}</div>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-400 font-bold">
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
              <p className="text-gray-400 text-sm mt-0.5">Resumen de actividad de Nexa One Life</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Créditos asignados manualmente", value: creditHistory.reduce((a, b) => a + b.creditos, 0), icon: Gift, color: "text-purple-400", bg: "bg-purple-900/20 border-purple-700/30" },
                { label: "Asignaciones manuales", value: creditHistory.length, icon: Users, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-700/30" },
                { label: "Planes activos", value: planes.length, icon: CreditCard, color: "text-green-400", bg: "bg-green-900/20 border-green-700/30" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
                  <Icon size={22} className={`${color} mb-3`} />
                  <div className={`text-3xl font-black ${color}`}>{value}</div>
                  <div className="text-gray-400 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
              <h3 className="font-bold text-white mb-4">Planes configurados</h3>
              <div className="space-y-3">
                {planes.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{plan.nombre}</span>
                      {plan.popular && <span className="text-xs bg-indigo-600/40 text-indigo-300 px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-indigo-300">{plan.creditos} créditos</span>
                      <span className="text-green-400 font-bold">${plan.precio} MXN</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-sm text-gray-500">
              Para estadísticas avanzadas (ventas reales, usuarios activos, etc.) se requiere conectar una base de datos. Puedo ayudarte a configurarlo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
