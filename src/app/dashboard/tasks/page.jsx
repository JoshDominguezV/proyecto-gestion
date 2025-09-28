// src/app/dashboard/tasks/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getTasks, updateTask, deleteTask } from "@/services/taskService";
import { getProjects } from "@/services/projectService";
import { getUsers } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData, usersData] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers()
      ]);
      
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const toggleStatus = async (task) => {
    if (user?.role === "usuario" && task.assignedTo !== user.id) {
      return alert("No puedes modificar esta tarea");
    }
    
    try {
      await updateTask(task.id, {
        ...task,
        status: task.status === "pendiente" ? "completada" : "pendiente"
      });
      await load();
      alert("Estado de tarea actualizado");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error al actualizar la tarea");
    }
  };

  const handleDelete = async (id) => {
    if (user?.role !== "gerente") {
      return alert("Solo el gerente puede eliminar tareas");
    }
    
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    
    try {
      await deleteTask(id);
      await load();
      alert("Tarea eliminada exitosamente");
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error al eliminar la tarea");
    }
  };

const getUserName = (id) => {
  const user = users.find(u => String(u.id) === String(id));
  return user ? user.username : "Sin asignar";
};


  const getProjectName = (id) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "—";
  };

  // Filtrar tareas según el rol
  const visibleTasks = user?.role === "gerente" 
    ? tasks 
    : tasks.filter(t => t.assignedTo === user.id);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando tareas...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tareas</h1>
          {user?.role === "gerente" && (
            <Link 
              href="/dashboard/tasks/create" 
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Nueva tarea
            </Link>
          )}
        </div>

        {visibleTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay tareas {user?.role === "usuario" ? "asignadas a ti" : "creadas"}</p>
            {user?.role === "gerente" && (
              <Link 
                href="/dashboard/tasks/create" 
                className="text-blue-400 hover:text-blue-300"
              >
                Crear primera tarea
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleTasks.map(task => (
              <div key={task.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-semibold text-lg ${
                        task.status === "completada" ? "line-through text-gray-400" : "text-white"
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        task.status === "completada" 
                          ? "bg-green-600 text-white" 
                          : task.status === "en progreso"
                          ? "bg-yellow-600 text-black"
                          : "bg-gray-600 text-white"
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{task.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                      <div>
                        <span className="font-medium">Proyecto:</span> {getProjectName(task.projectId)}
                      </div>
                      <div>
                        <span className="font-medium">Asignada a:</span> {getUserName(task.assignedTo)}
                      </div>
                      <div>
                        <span className="font-medium">Creada:</span> {task.createdAt || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {/* Botón para cambiar estado */}
                    {(user?.role === "gerente" || task.assignedTo === user.id) && (
                      <button 
                        onClick={() => toggleStatus(task)}
                        className="bg-yellow-500 px-3 py-2 rounded hover:bg-yellow-600 transition-colors text-sm whitespace-nowrap"
                      >
                        {task.status === "pendiente" ? "✅ Completar" : "↩️ Reabrir"}
                      </button>
                    )}
                    
                    {/* Botones solo para gerente */}
                    {user?.role === "gerente" && (
                      <>
                        <Link 
                          href={`/dashboard/tasks/${task.id}`}
                          className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm text-center"
                        >
                          ✏️ Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas para gerente */}
        {user?.role === "gerente" && tasks.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-3">Estadísticas de tareas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-700 rounded">
                <div className="text-2xl font-bold">{tasks.length}</div>
                <div className="text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-green-600 rounded">
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "completada").length}
                </div>
                <div className="text-white">Completadas</div>
              </div>
              <div className="text-center p-3 bg-yellow-600 rounded">
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "en progreso").length}
                </div>
                <div className="text-black">En progreso</div>
              </div>
              <div className="text-center p-3 bg-gray-600 rounded">
                <div className="text-2xl font-bold">
                  {tasks.filter(t => t.status === "pendiente").length}
                </div>
                <div className="text-gray-300">Pendientes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}