import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Plan {
  id: string;
  nombre: string;
  creditos: number;
  precio: number;
  popular?: boolean;
  descripcion: string;
}

export const PLANES: Plan[] = [
  { id: "starter", nombre: "Starter", creditos: 10, precio: 99, descripcion: "Ideal para probar Nexa One Life" },
  { id: "pro", nombre: "Pro", creditos: 50, precio: 285, popular: true, descripcion: "Para proyectos frecuentes" },
  { id: "business", nombre: "Business", creditos: 100, precio: 570, descripcion: "Para uso intensivo y equipos" },
];

export const COSTO_POR_GENERACION = 1;

// Cálculo dinámico de créditos según complejidad del prompt
export function calcularCosto(prompt: string): number {
  const lower = prompt.toLowerCase();
  const palabras = prompt.split(/\s+/).length;
  
  // Keywords de alta complejidad (3 créditos)
  const altaComplejidad = ['dashboard', 'crm', 'ecommerce', 'e-commerce', 'tienda online', 'sistema completo', 'saas', 'plataforma', 'marketplace', 'erp', 'inventario completo', 'punto de venta', 'pos'];
  if (altaComplejidad.some(k => lower.includes(k)) || palabras > 80) return 3;
  
  // Keywords de media complejidad (2 créditos)
  const mediaComplejidad = ['sistema', 'aplicación', 'app completa', 'con base de datos', 'con login', 'con autenticación', 'catálogo', 'agenda', 'citas', 'reservaciones', 'facturación'];
  if (mediaComplejidad.some(k => lower.includes(k)) || palabras > 40) return 2;
  
  // Baja complejidad (1 crédito)
  return 1;
}

export interface Version {
  id: string;
  html: string;
  prompt: string;
  timestamp: number;
  label: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  html: string;
  versions: Version[];
  createdAt: number;
  updatedAt: number;
  deployUrl?: string;
}

interface UserStore {
  creditos: number;
  githubToken: string;
  githubRepo: string;
  generaciones: number;
  proyectos: Proyecto[];
  proyectoActualId: string | null;
  // Acciones créditos
  addCreditos: (n: number) => void;
  consumirCredito: () => boolean;
  setGithubToken: (token: string) => void;
  setGithubRepo: (repo: string) => void;
  incrementarGeneraciones: () => void;
  // Acciones proyectos
  crearProyecto: (nombre: string, html: string, prompt: string) => string;
  actualizarProyecto: (id: string, html: string, prompt: string) => void;
  eliminarProyecto: (id: string) => void;
  setProyectoActual: (id: string | null) => void;
  getProyectoActual: () => Proyecto | null;
  restaurarVersion: (proyectoId: string, versionId: string) => void;
  setDeployUrl: (proyectoId: string, url: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      creditos: 10,
      githubToken: "",
      githubRepo: "nexaonelife-app",
      generaciones: 0,
      proyectos: [],
      proyectoActualId: null,

      addCreditos: (n) => set((s) => ({ creditos: s.creditos + n })),

      consumirCredito: (costo?: number) => {
        const { creditos } = get();
        const costoReal = costo ?? COSTO_POR_GENERACION;
        if (creditos < costoReal) return false;
        set((s) => ({ creditos: s.creditos - costoReal }));
        return true;
      },

      setGithubToken: (token) => set({ githubToken: token }),
      setGithubRepo: (repo) => set({ githubRepo: repo }),
      incrementarGeneraciones: () => set((s) => ({ generaciones: s.generaciones + 1 })),

      crearProyecto: (nombre, html, prompt) => {
        const id = `proj_${Date.now()}`;
        const version: Version = {
          id: `v_${Date.now()}`,
          html,
          prompt,
          timestamp: Date.now(),
          label: "v1 — Inicial",
        };
        const proyecto: Proyecto = {
          id,
          nombre,
          html,
          versions: [version],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ proyectos: [proyecto, ...s.proyectos], proyectoActualId: id }));
        return id;
      },

      actualizarProyecto: (id, html, prompt) => {
        set((s) => {
          const proyectos = s.proyectos.map((p) => {
            if (p.id !== id) return p;
            const vNum = p.versions.length + 1;
            const version: Version = {
              id: `v_${Date.now()}`,
              html,
              prompt,
              timestamp: Date.now(),
              label: `v${vNum} — ${prompt.slice(0, 30)}${prompt.length > 30 ? "..." : ""}`,
            };
            return { ...p, html, versions: [...p.versions, version], updatedAt: Date.now() };
          });
          return { proyectos };
        });
      },

      eliminarProyecto: (id) => {
        set((s) => ({
          proyectos: s.proyectos.filter((p) => p.id !== id),
          proyectoActualId: s.proyectoActualId === id ? null : s.proyectoActualId,
        }));
      },

      setProyectoActual: (id) => set({ proyectoActualId: id }),

      getProyectoActual: () => {
        const { proyectos, proyectoActualId } = get();
        return proyectos.find((p) => p.id === proyectoActualId) ?? null;
      },

      restaurarVersion: (proyectoId, versionId) => {
        set((s) => ({
          proyectos: s.proyectos.map((p) => {
            if (p.id !== proyectoId) return p;
            const version = p.versions.find((v) => v.id === versionId);
            if (!version) return p;
            return { ...p, html: version.html, updatedAt: Date.now() };
          }),
        }));
      },

      setDeployUrl: (proyectoId, url) => {
        set((s) => ({
          proyectos: s.proyectos.map((p) =>
            p.id === proyectoId ? { ...p, deployUrl: url } : p
          ),
        }));
      },
    }),
    {
      name: "nexaonelife-user-v2",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = (persistedState ?? {}) as Record<string, unknown>;
        // Si viene de versión anterior o tiene 0 créditos, dar 5 créditos de bienvenida
        if (version < 2 || !state.creditos || (state.creditos as number) === 0) {
          return { ...state, creditos: 5 };
        }
        return state;
      },
    }
  )
);
