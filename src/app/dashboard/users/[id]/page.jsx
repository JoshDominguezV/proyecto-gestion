// src/app/dashboard/users/[id]/page.js
"use client";
import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserById } from "@/services/userService";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function UserDetailPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const user = await getUserById(userId);
        setUserData(user);
      } catch (error) {
        console.error("Error loading user:", error);
        alert("Error al cargar el usuario");
        router.push("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, router]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando usuario...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userData) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">Usuario no encontrado</p>
            <button 
              onClick={() => router.push("/dashboard/users")}
              className="text-blue-400 hover:text-blue-300"
            >
              Volver a la lista de usuarios
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="bg-gray-700 p-2 rounded hover:bg-gray-600"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Detalles del Usuario</h1>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">ID</h3>
              <p className="text-white">{userData.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Nombre de usuario</h3>
              <p className="text-white">{userData.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Rol</h3>
              <p className="text-white">
                <span className={`px-2 py-1 rounded text-xs ${
                  userData.role === "gerente" 
                    ? "bg-purple-600" 
                    : "bg-blue-600"
                }`}>
                  {userData.role}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Estado</h3>
              <p className="text-white">
                <span className={`px-2 py-1 rounded text-xs ${
                  userData.active 
                    ? "bg-green-600" 
                    : "bg-yellow-600"
                }`}>
                  {userData.active ? "Activo" : "Inactivo/Pendiente"}
                </span>
              </p>
            </div>
          </div>
          
          {currentUser.role === "gerente" && (
            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-600">
              <Link
                href={`/dashboard/users/${userData.id}/edit`}
                className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
              >
                ✏️ Editar Usuario
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}