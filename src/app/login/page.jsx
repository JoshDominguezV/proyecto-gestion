// src/app/login/page.js
"use client";
import { useState, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, register } = useContext(AuthContext);
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password, "usuario");
        setErr("¡Registro exitoso! Su cuenta está pendiente de verificación por un administrador. Se le notificará cuando pueda acceder.");
        setIsRegister(false);
        setUsername("");
        setPassword("");
      } else {
        await login(username, password);
        router.push("/dashboard");
      }
    } catch (error) {
      setErr((error && error.message) || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg rounded p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? "Registrar cuenta" : "Iniciar Sesión"}
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            className="border border-gray-600 bg-gray-700 p-2 rounded text-white"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="border border-gray-600 bg-gray-700 p-2 rounded text-white"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err && (
            <div className={`p-3 rounded text-sm ${
              err.includes("pendiente de verificación") || err.includes("éxito") 
                ? "bg-yellow-600 text-yellow-100" 
                : "bg-red-600 text-red-100"
            }`}>
              {err}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : isRegister ? "Registrar" : "Ingresar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setErr(""); }}
            className="text-blue-400 hover:underline"
          >
            {isRegister ? "Inicia Sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}