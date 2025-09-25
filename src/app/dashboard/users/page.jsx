// src/app/dashboard/users/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUsers, deleteUser, updateUser } from "@/services/userService";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user: currentUser } = useContext(AuthContext);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (currentUser.role !== "gerente") {
      alert("Solo el gerente puede eliminar usuarios");
      return;
    }
    
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    
    try {
      await deleteUser(id);
      await loadUsers();
      alert("Usuario eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error al eliminar el usuario. Por favor, intenta nuevamente.");
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    if (currentUser.role !== "gerente") {
      alert("Solo el gerente puede activar/desactivar usuarios");
      return;
    }
    
    if (!confirm(`¿Estás seguro de ${currentActive ? "desactivar" : "activar"} este usuario?`)) return;
    
    try {
      setUpdating(true);
      // Obtener el usuario actual primero
      const userToUpdate = users.find(u => u.id === id);
      if (!userToUpdate) return;
      
      // Actualizar solo el campo active
      await updateUser(id, {
        ...userToUpdate,
        active: !currentActive
      });
      
      await loadUsers(); // Recargar la lista
      alert(`Usuario ${currentActive ? "desactivado" : "activado"} exitosamente`);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar el usuario. Por favor, intenta nuevamente.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando usuarios...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          {currentUser.role === "gerente" && (
            <Link 
              href="/dashboard/users/create" 
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              ➕ Nuevo usuario
            </Link>
          )}
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay usuarios registrados</p>
            {currentUser.role === "gerente" && (
              <Link 
                href="/dashboard/users/create" 
                className="text-blue-400 hover:text-blue-300"
              >
                Crear primer usuario
              </Link>
            )}
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
                {users.map((userItem) => (
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
                      <span className={`px-2 py-1 rounded text-xs ${
                        userItem.active 
                          ? "bg-green-600" 
                          : "bg-yellow-600"
                      }`}>
                        {userItem.active ? "Activo" : "Pendiente"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        <Link 
                          href={`/dashboard/users/${userItem.id}`}
                          className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          👁️ Ver
                        </Link>
                        
                        {currentUser.role === "gerente" && (
                          <>
                            <Link 
                              href={`/dashboard/users/${userItem.id}/edit`}
                              className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                            >
                              ✏️ Editar
                            </Link>
                            <button 
                              onClick={() => handleToggleActive(userItem.id, userItem.active)}
                              disabled={updating}
                              className={`px-3 py-1 rounded transition-colors text-sm disabled:opacity-50 ${
                                userItem.active 
                                  ? "bg-orange-600 hover:bg-orange-700" 
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                              title={userItem.id === currentUser.id ? "No puedes desactivar tu propio usuario" : ""}
                            >
                              {userItem.active ? "⏸️ Desactivar" : "✅ Activar"}
                            </button>
                            <button 
                              onClick={() => handleDelete(userItem.id)}
                              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                              disabled={userItem.id === currentUser.id}
                              title={userItem.id === currentUser.id ? "No puedes eliminar tu propio usuario" : ""}
                            >
                              🗑️ Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentUser.role === "gerente" && users.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-3">Estadísticas de usuarios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-700 rounded">
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-green-600 rounded">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.active).length}
                </div>
                <div className="text-white">Activos</div>
              </div>
              <div className="text-center p-3 bg-yellow-600 rounded">
                <div className="text-2xl font-bold">
                  {users.filter(u => !u.active).length}
                </div>
                <div className="text-white">Pendientes</div>
              </div>
              <div className="text-center p-3 bg-purple-600 rounded">
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === "gerente").length}
                </div>
                <div className="text-white">Gerentes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}