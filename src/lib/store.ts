import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Plan {
  id: string;
  nombre: string;
  creditos: number;
  precio: number; // en pesos MXN
  popular?: boolean;
  descripcion: string;
}

export const PLANES: Plan[] = [
  {
    id: "starter",
    nombre: "Starter",
    creditos: 10,
    precio: 99,
    descripcion: "Ideal para probar Nexa One Life",
  },
  {
    id: "pro",
    nombre: "Pro",
    creditos: 50,
    precio: 285,
    popular: true,
    descripcion: "Para proyectos frecuentes",
  },
  {
    id: "business",
    nombre: "Business",
    creditos: 100,
    precio: 570,
    descripcion: "Para uso intensivo y equipos",
  },
];

export const COSTO_POR_GENERACION = 1; // 1 crédito por generación

interface UserStore {
  creditos: number;
  githubToken: string;
  githubRepo: string;
  generaciones: number;
  // Acciones
  addCreditos: (n: number) => void;
  consumirCredito: () => boolean;
  setGithubToken: (token: string) => void;
  setGithubRepo: (repo: string) => void;
  incrementarGeneraciones: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      creditos: 5, // 5 créditos gratis al inicio
      githubToken: "",
      githubRepo: "nexaonelife-app",
      generaciones: 0,

      addCreditos: (n) => set((s) => ({ creditos: s.creditos + n })),

      consumirCredito: () => {
        const { creditos } = get();
        if (creditos <= 0) return false;
        set((s) => ({ creditos: s.creditos - COSTO_POR_GENERACION }));
        return true;
      },

      setGithubToken: (token) => set({ githubToken: token }),
      setGithubRepo: (repo) => set({ githubRepo: repo }),
      incrementarGeneraciones: () => set((s) => ({ generaciones: s.generaciones + 1 })),
    }),
    {
      name: "nexaonelife-user",
    }
  )
);
