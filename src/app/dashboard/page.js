// src/app/dashboard/page.js
"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold mb-4">Bienvenido, {user?.username}</h1>
        <p className="mb-2">Rol: {user?.role}</p>
        <p className="text-sm text-gray-300">Usa el menú lateral para gestionar proyectos y tareas.</p>
      </div>
    </ProtectedRoute>
  );
}
