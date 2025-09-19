// src/app/dashboard/projects/create/page.js
"use client";
import { useState, useEffect } from "react";
import { createProject } from "@/services/projectService";
import { getUsers } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const u = await getUsers();
      setUsers(u);
    })();
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Nombre requerido");

    setLoading(true);
    try {
      const numericMembers = selectedMembers.map((member) =>
        typeof member === "string" ? parseInt(member, 10) : member
      );

      await createProject({
        name,
        description,
        createdAt: new Date().toISOString().slice(0, 10),
        members: numericMembers,
      });
      
      alert("Proyecto creado exitosamente");
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error al crear el proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear nuevo proyecto</h1>
      
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Nombre del proyecto"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Descripción del proyecto"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Seleccionar miembros (opcional)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => toggleMember(u.id)}
                className={`p-3 rounded border-2 transition-colors text-left ${
                  selectedMembers.includes(u.id)
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <div className="font-medium">{u.username}</div>
                <div className="text-xs opacity-75">{u.role}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {selectedMembers.length} miembro(s) seleccionado(s)
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear proyecto"}
          </button>
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/projects")}
            className="bg-gray-600 px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}