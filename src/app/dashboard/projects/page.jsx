// src/app/dashboard/projects/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getProjects, deleteProject } from "@/services/projectService";
import Link from "next/link";
import { getTasks } from "@/services/taskService";
import { AuthContext } from "@/context/AuthContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const load = async () => {
    try {
      setLoading(true);
      const [p, allTasks] = await Promise.all([getProjects(), getTasks()]);
      setProjects(p);
      
      const map = {};
      p.forEach(proj => {
        const tasks = allTasks.filter(t => t.projectId === proj.id);
        const done = tasks.filter(t => t.status === "completada").length;
        const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
        map[proj.id] = percent;
      });
      setProgress(map);
    } catch (error) {
      console.error("Error loading projects:", error);
      alert("Error al cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (user?.role !== "gerente") {
      alert("Solo el gerente puede eliminar proyectos");
      return;
    }
    
    if (!confirm("¿Estás seguro de eliminar este proyecto?")) return;
    
    try {
      await deleteProject(id);
      await load();
      alert("Proyecto eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("Error al eliminar el proyecto. Por favor, intenta nuevamente.");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando proyectos...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Proyectos</h1>
          {user?.role === "gerente" && (
            <Link 
              href="/dashboard/projects/create" 
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              ➕ Nuevo proyecto
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay proyectos creados</p>
            {user?.role === "gerente" && (
              <Link 
                href="/dashboard/projects/create" 
                className="text-blue-400 hover:text-blue-300"
              >
                Crear primer proyecto
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-white">
                        {project.name}
                      </h3>
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs text-white">
                        ID: {project.id}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{project.description || "Sin descripción"}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                      <div>
                        <span className="font-medium">Progreso:</span>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress[project.id] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{progress[project.id] || 0}% completado</span>
                      </div>
                      <div>
                        <span className="font-medium">Creado:</span> {project.createdAt || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Miembros:</span> {project.members?.length || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link 
                      href={`/dashboard/projects/${project.id}`}
                      className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm text-center"
                    >
                      👁️ Ver
                    </Link>
                    
                    {user?.role === "gerente" && (
                      <>
                        <Link 
                          href={`/dashboard/projects/${project.id}/edit`}
                          className="bg-yellow-500 px-3 py-2 rounded hover:bg-yellow-600 transition-colors text-sm text-center"
                        >
                          ✏️ Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(project.id)}
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
        {user?.role === "gerente" && projects.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="font-semibold mb-3">Estadísticas de proyectos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-700 rounded">
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-green-600 rounded">
                <div className="text-2xl font-bold">
                  {Object.values(progress).filter(p => p === 100).length}
                </div>
                <div className="text-white">Completados</div>
              </div>
              <div className="text-center p-3 bg-yellow-600 rounded">
                <div className="text-2xl font-bold">
                  {Object.values(progress).filter(p => p > 0 && p < 100).length}
                </div>
                <div className="text-black">En progreso</div>
              </div>
              <div className="text-center p-3 bg-gray-600 rounded">
                <div className="text-2xl font-bold">
                  {Object.values(progress).filter(p => p === 0).length}
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