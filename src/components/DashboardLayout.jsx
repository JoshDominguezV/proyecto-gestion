"use client";
import Link from "next/link";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col fixed h-full">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <p className="mb-2">Usuario: {user?.username}</p>
        <p className="mb-4">Rol: {user?.role}</p>

        <nav className="flex flex-col gap-2 mb-4">
          <Link href="/dashboard/projects" className="hover:bg-gray-700 p-2 rounded">
            Proyectos
          </Link>
          <Link href="/dashboard/tasks" className="hover:bg-gray-700 p-2 rounded">
            Tareas
          </Link>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 ml-64 p-6 bg-gray-100 overflow-auto">{children}</main>
    </div>
  );
}
