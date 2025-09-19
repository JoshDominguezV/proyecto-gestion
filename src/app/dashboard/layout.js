// src/app/dashboard/layout.js
"use client";
import Link from "next/link";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Menu, X } from "lucide-react"; // íconos para abrir/cerrar menú

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 p-6 flex flex-col transform 
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">ProyectoGestión</h2>
          {/* Botón cerrar (solo visible en móviles) */}
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="mb-2">Usuario: {user?.username}</p>
        <p className="mb-4">Rol: {user?.role}</p>

        <nav className="flex flex-col gap-2 mb-4">
          <Link href="/dashboard" className="hover:bg-gray-700 p-2 rounded">Inicio</Link>
          <Link href="/dashboard/projects" className="hover:bg-gray-700 p-2 rounded">Proyectos</Link>
          <Link href="/dashboard/tasks" className="hover:bg-gray-700 p-2 rounded">Tareas</Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 md:ml-64 p-6 bg-gray-900 overflow-auto">
        {/* Botón hamburguesa (solo móviles) */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-gray-800 p-2 rounded"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded shadow min-h-[80vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
