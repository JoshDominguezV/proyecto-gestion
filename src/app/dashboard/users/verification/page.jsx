// src/app/dashboard/users/verification/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getPendingUsers, updateUserActivation } from "@/services/authService";
import { AuthContext } from "@/context/AuthContext";

export default function UserVerificationPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user: currentUser } = useContext(AuthContext);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error("Error loading pending users:", error);
      alert("Error al cargar usuarios pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "gerente") {
      loadPendingUsers();
    }
  }, [currentUser]);

  const handleActivation = async (userId, activate) => {
    if (currentUser.role !== "gerente") {
      alert("Solo el gerente puede verificar usuarios");
      return;
    }
    
    if (!confirm(`¿Estás seguro de ${activate ? "activar" : "mantener inactivo"} este usuario?`)) return;
    
    try {
      setUpdating(true);
      await updateUserActivation(userId, activate);
      await loadPendingUsers(); // Recargar la lista
      alert(`Usuario ${activate ? "activado" : "mantenido inactivo"} exitosamente`);
    } catch (error) {
      console.error("Error updating user activation:", error);
      alert("Error al actualizar el usuario. Por favor, intenta nuevamente.");
    } finally {
      setUpdating(false);
    }
  };

  if (currentUser?.role !== "gerente") {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="text-center py-12 text-red-400">
            <p className="text-lg mb-2">No tienes permisos para acceder a esta página</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando usuarios pendientes...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Verificación de Usuarios</h1>
          <button 
            onClick={loadPendingUsers}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay usuarios pendientes de verificación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-600">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Usuario</th>
                  <th className="p-3 text-left">Rol</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((userItem) => (
                  <tr key={userItem.id} className="border-b border-gray-600 hover:bg-gray-650">
                    <td className="p-3">{userItem.id}</td>
                    <td className="p-3 font-medium">{userItem.username}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        userItem.role === "gerente" 
                          ? "bg-purple-600" 
                          : "bg-blue-600"
                      }`}>
                        {userItem.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-yellow-600">
                        Pendiente
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleActivation(userItem.id, true)}
                          disabled={updating}
                          className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                        >
                          ✅ Activar
                        </button>
                        <button 
                          onClick={() => handleActivation(userItem.id, false)}
                          disabled={updating}
                          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}