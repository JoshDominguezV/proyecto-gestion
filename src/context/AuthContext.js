// src/context/AuthContext.js
"use client";
import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser, sanitizeUser } from "@/services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // inicializar desde localStorage (sin window error)
  const [user, setUser] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (username, password) => {
    // validación básica
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
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  // opcional: refrescar user desde storage si cambia (poca necesidad)
  useEffect(() => {
    // nada especial, ya inicializado
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
