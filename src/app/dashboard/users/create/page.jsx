// src/app/dashboard/users/create/page.js
"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createUser } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";
 
export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "usuario",
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  const { user: currentUser } = useContext(AuthContext);
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 3) {
      newErrors.password = "La contraseña debe tener al menos 3 caracteres";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createUser(formData);
      alert("Usuario creado exitosamente");
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error al crear el usuario. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <ProtectedRoute>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h1>
        
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
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 bg-gray-700 rounded ${errors.password ? "border border-red-500" : ""}`}
              placeholder="Ingrese la contraseña"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
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
          
          {/* Verificar que currentUser existe antes de acceder a su propiedad role */}
          {currentUser && currentUser?.role === "gerente" && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="mr-2"
                id="active-checkbox"
              />
              <label htmlFor="active-checkbox" className="text-sm">
                Usuario activo (puede iniciar sesión)
              </label>
            </div>
          )}
          
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
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
 