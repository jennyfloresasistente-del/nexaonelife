/**
 * Sistema de autenticación con localStorage
 * - Registro y login con email + contraseña
 * - Persistencia entre sesiones
 * - Estado global con Zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  avatar: string; // iniciales del nombre
  createdAt: number;
}

interface AuthStore {
  user: AuthUser | null;
  isLoggedIn: boolean;
  // Acciones
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (email: string, password: string, nombre?: string) => { ok: boolean; error?: string };
  logout: () => void;
}

// Usuarios guardados en localStorage (clave separada)
const USERS_KEY = "nexaonelife_users_db";

function getUsers(): Record<string, { password: string; nombre: string; createdAt: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { password: string; nombre: string; createdAt: number }>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeAvatar(email: string, nombre?: string): string {
  if (nombre && nombre.trim()) {
    const parts = nombre.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (email: string, password: string) => {
        const emailLower = email.trim().toLowerCase();
        if (!emailLower || !password) {
          return { ok: false, error: "Completa todos los campos" };
        }
        const users = getUsers();
        const userData = users[emailLower];
        if (!userData) {
          return { ok: false, error: "No existe una cuenta con ese correo" };
        }
        if (userData.password !== password) {
          return { ok: false, error: "Contraseña incorrecta" };
        }
        const user: AuthUser = {
          id: emailLower,
          email: emailLower,
          nombre: userData.nombre || emailLower.split("@")[0],
          avatar: makeAvatar(emailLower, userData.nombre),
          createdAt: userData.createdAt,
        };
        set({ user, isLoggedIn: true });
        return { ok: true };
      },

      register: (email: string, password: string, nombre?: string) => {
        const emailLower = email.trim().toLowerCase();
        if (!emailLower || !password) {
          return { ok: false, error: "Completa todos los campos" };
        }
        if (password.length < 6) {
          return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };
        }
        const users = getUsers();
        if (users[emailLower]) {
          return { ok: false, error: "Ya existe una cuenta con ese correo" };
        }
        const nombreFinal = nombre?.trim() || emailLower.split("@")[0];
        users[emailLower] = { password, nombre: nombreFinal, createdAt: Date.now() };
        saveUsers(users);
        const user: AuthUser = {
          id: emailLower,
          email: emailLower,
          nombre: nombreFinal,
          avatar: makeAvatar(emailLower, nombreFinal),
          createdAt: Date.now(),
        };
        set({ user, isLoggedIn: true });
        return { ok: true };
      },

      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
    }),
    {
      name: "nexaonelife-auth-v1",
    }
  )
);
