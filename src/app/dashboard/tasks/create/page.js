// src/app/dashboard/tasks/create/page.js
"use client";
import { useState, useEffect } from "react";
import { createTask } from "@/services/taskService";
import { getProjects } from "@/services/projectService";
import { getUsers } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function CreateTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const [p, u] = await Promise.all([getProjects(), getUsers()]);
      setProjects(p);
      setUsers(u);
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return alert("Título y proyecto son requeridos");
    
    await createTask({
      title,
      description,
      projectId: parseInt(projectId, 10),
      assignedTo: assignedTo ? parseInt(assignedTo, 10) : null,
      status: "pendiente",
      createdAt: new Date().toISOString().slice(0,10)
    });
    
    router.push("/dashboard/tasks");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear nueva tarea</h1>
      
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título *</label>
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Título de la tarea"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Descripción de la tarea"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Proyecto *</label>
          <select 
            value={projectId} 
            onChange={e => setProjectId(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">Seleccionar proyecto</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Asignar a (opcional)</label>
          <select 
            value={assignedTo} 
            onChange={e => setAssignedTo(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
          >
            <option value="">Sin asignar</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-green-600 px-6 py-2 rounded hover:bg-green-700">
            Crear tarea
          </button>
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/tasks")}
            className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}