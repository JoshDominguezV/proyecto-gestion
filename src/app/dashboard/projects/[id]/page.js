// src/app/dashboard/projects/[id]/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById } from "@/services/projectService";
import { getTasksByProject } from "@/services/taskService";
import { getUsers } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function ViewProject() {
  const params = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const projectId = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;
        
        if (isNaN(projectId)) {
          throw new Error("ID de proyecto inválido");
        }

        const [projectData, tasksData, usersData] = await Promise.all([
          getProjectById(projectId),
          getTasksByProject(projectId),
          getUsers()
        ]);
        
        setProject(projectData);
        setTasks(tasksData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error al cargar los datos del proyecto");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Cargando proyecto...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <div className="bg-yellow-600 p-4 rounded mb-4">
            <p className="text-white">Proyecto no encontrado</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard/projects")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Volver a proyectos
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "completada").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const memberNames = project.members?.map(memberId => {
    const numericMemberId = typeof memberId === "string" ? parseInt(memberId, 10) : memberId;
    const user = users.find(u => {
      const numericUserId = typeof u.id === "string" ? parseInt(u.id, 10) : u.id;
      return numericUserId === numericMemberId;
    });
    return user ? user.username : `Usuario ${memberId}`;
  }) || [];

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Proyecto: {project.name}</h1>
          <button 
            onClick={() => router.push("/dashboard/projects")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-white">Información del proyecto</h3>
              <p className="text-gray-300 mb-4">{project.description || "Sin descripción"}</p>
              <div className="text-sm text-gray-400 space-y-2">
                <div><span className="font-medium">ID:</span> {project.id}</div>
                <div><span className="font-medium">Creado:</span> {project.createdAt || "N/A"}</div>
                <div><span className="font-medium">Miembros:</span> {project.members?.length || 0}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-white">Progreso del proyecto</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Completado</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-gray-400 space-y-2">
                <div><span className="font-medium">Tareas totales:</span> {tasks.length}</div>
                <div><span className="font-medium">Completadas:</span> {completedTasks}</div>
                <div><span className="font-medium">Pendientes:</span> {tasks.length - completedTasks}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {user.role === "gerente" && (
            <Link 
              href={`/dashboard/projects/${project.id}/edit`}
              className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              ✏️ Editar proyecto
            </Link>
          )}
          <Link 
            href={`/dashboard/tasks?project=${project.id}`}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            👁️ Ver tareas
          </Link>
          <Link 
            href={`/dashboard/tasks/create?project=${project.id}`}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            ➕ Nueva tarea
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold mb-3 text-white">Miembros del proyecto</h3>
            {memberNames.length > 0 ? (
              <ul className="space-y-2">
                {memberNames.map((name, index) => (
                  <li key={index} className="text-gray-300 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No hay miembros asignados</p>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold mb-3 text-white">Últimas tareas</h3>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <span className="text-gray-300 text-sm">{task.title}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === "completada" ? "bg-green-600 text-white" : 
                      task.status === "en progreso" ? "bg-yellow-600 text-black" : "bg-gray-600 text-white"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <p className="text-gray-400 text-sm mt-2">
                    ... y {tasks.length - 5} tareas más
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No hay tareas en este proyecto</p>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}