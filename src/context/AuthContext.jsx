// src/context/AuthContext.js
"use client";
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, sanitizeUser } from "@/services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (typeof window === "undefined") {
          setLoading(false);
          return;
        }
        
        const s = localStorage.getItem("user");
        if (s) {
          const parsed = JSON.parse(s);
          setUser(parsed);
        }
      } catch (e) {
        console.error("Error loading user from localStorage:", e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    if (!username || !password) throw new Error("Usuario y contraseña requeridos");
    const found = await loginUser(username, password);
    if (!found) throw new Error("Credenciales inválidas");
    const sanitized = sanitizeUser(found);
    setUser(sanitized);
    localStorage.setItem("user", JSON.stringify(sanitized));
    return sanitized;
  };

  const register = async (username, password, role = "usuario") => {
    if (!username || !password) throw new Error("Usuario y contraseña requeridos");
    const created = await registerUser({ username, password, role });
    const sanitized = sanitizeUser(created);
    setUser(sanitized);
    localStorage.setItem("user", JSON.stringify(sanitized));
    return sanitized;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Redirigir inmediatamente
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}