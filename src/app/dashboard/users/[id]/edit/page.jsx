// src/app/dashboard/users/[id]/edit/page.jsx
"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserById, updateUser } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";

export default function EditUserPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "usuario"
  });
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const params = useParams();
  const userId = params.id; // Ahora siempre será string
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const userData = await getUserById(userId);
        setFormData({
          username: userData.username,
          password: "",
          role: userData.role
        });
      } catch (error) {
        console.error("Error loading user:", error);
        alert("Error al cargar el usuario");
        router.push("/dashboard/users");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [userId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      
      await updateUser(userId, dataToSend);
      alert("Usuario actualizado exitosamente");
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error al actualizar el usuario. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
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

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Usuario</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-700 rounded ${errors.username ? "border border-red-500" : ""}`}
              placeholder="Ingrese el nombre de usuario"
            />
            {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña (dejar en blanco para no cambiar)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Ingrese nueva contraseña (opcional)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="usuario">Usuario</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}