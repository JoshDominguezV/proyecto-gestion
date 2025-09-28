// src/app/dashboard/tasks/[id]/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTaskById, updateTask } from "@/services/taskService";
import { getProjects } from "@/services/projectService";
import { getUsers } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditTask() {
  const params = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const taskId = params.id; 
        
        const [taskData, projectsData, usersData] = await Promise.all([
          getTaskById(taskId),
          getProjects(),
          getUsers()
        ]);
        
        setTask(taskData);
        setProjects(projectsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error al cargar los datos de la tarea");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (user.role !== "gerente") {
      alert("Solo el gerente puede editar tareas");
      return;
    }

    try {
      setSaving(true);
      await updateTask(task.id, task);
      alert("Tarea actualizada exitosamente");
      router.push("/dashboard/tasks");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error al actualizar la tarea");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando tarea...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="bg-yellow-600 p-4 rounded mb-4">
            <p className="text-white">Tarea no encontrada</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard/tasks")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver a tareas
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Editar tarea #{task.id}</h1>
          <button 
            onClick={() => router.push("/dashboard/tasks")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título *</label>
            <input 
              value={task.title || ""} 
              onChange={e => handleChange('title', e.target.value)} 
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              required
              disabled={user.role !== "gerente"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea 
              value={task.description || ""} 
              onChange={e => handleChange('description', e.target.value)} 
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              rows="3"
              disabled={user.role !== "gerente"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Proyecto *</label>
            <select 
              value={task.projectId || ""} 
              onChange={e => handleChange('projectId', parseInt(e.target.value, 10))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              required
              disabled={user.role !== "gerente"}
            >
              <option value="">Seleccionar proyecto</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Asignar a</label>
            <select 
              value={task.assignedTo || ""} 
              onChange={e => handleChange('assignedTo', e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              disabled={user.role !== "gerente"}
            >
              <option value="">Sin asignar</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select 
              value={task.status || "pendiente"} 
              onChange={e => handleChange('status', e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              disabled={user.role !== "gerente"}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          {user.role === "gerente" ? (
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="bg-yellow-500 px-6 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button 
                type="button" 
                onClick={() => router.push("/dashboard/tasks")}
                className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="bg-yellow-600 p-3 rounded text-center">
              <p className="text-white">Solo gerentes pueden editar tareas</p>
            </div>
          )}
        </form>
      </div>
    </ProtectedRoute>
  );
}