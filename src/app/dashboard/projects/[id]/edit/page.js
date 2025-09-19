// src/app/dashboard/projects/[id]/edit/page.js
"use client";
import { useEffect, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById, updateProject } from "@/services/projectService";
import { getUsers } from "@/services/userService";
import { AuthContext } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function EditProject() {
  const params = useParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const projectId = typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
        if (isNaN(projectId)) throw new Error("ID de proyecto inválido");

        const [projectData, usersData] = await Promise.all([
          getProjectById(projectId),
          getUsers(),
        ]);

        setProject({
          ...projectData,
          members: Array.isArray(projectData.members) ? projectData.members : [],
        });
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Error al cargar los datos del proyecto");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const toggleMember = (userId) => {
    if (!project) return;
    const currentMembers = Array.isArray(project.members) ? project.members : [];
    const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;

    setProject((prev) => ({
      ...prev,
      members: currentMembers.includes(numericUserId)
        ? currentMembers.filter((id) => {
            const numericId = typeof id === "string" ? parseInt(id, 10) : id;
            return numericId !== numericUserId;
          })
        : [...currentMembers, numericUserId],
    }));
  };

  const handleInputChange = (field, value) => {
    if (!project) return;
    setProject((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!project) return;

    if (user.role !== "gerente") {
      alert("Solo el gerente puede editar proyectos");
      return;
    }

    if (!project.name?.trim()) {
      setError("El nombre del proyecto es requerido");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const projectId = typeof params.id === "string" ? parseInt(params.id, 10) : params.id;
      if (isNaN(projectId)) throw new Error("ID de proyecto inválido");

      await updateProject(projectId, project);
      alert("Proyecto actualizado exitosamente");
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error updating project:", error);
      setError("Error al actualizar el proyecto. Por favor, intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64 text-gray-400">
          Cargando proyecto...
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !project) {
    return (
      <ProtectedRoute>
        <div className="p-4 space-y-4">
          <div className="bg-red-600 p-4 rounded">
            <p className="text-white">{error}</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            Volver a proyectos
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="p-4 space-y-4">
          <div className="bg-yellow-600 p-4 rounded">
            <p className="text-white">Proyecto no encontrado</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            Volver a proyectos
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">
            Editar proyecto #{project.id}
          </h1>
          <button
            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
          >
            ← Volver al proyecto
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-600 p-3 rounded">
            <p className="text-white">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={submit}
          className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6"
        >
          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Nombre del proyecto *
              </label>
              <input
                value={project.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
                placeholder="Nombre del proyecto"
                required
                disabled={user.role !== "gerente"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Fecha de creación
              </label>
              <input
                type="date"
                value={project.createdAt || ""}
                onChange={(e) => handleInputChange("createdAt", e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
                disabled={user.role !== "gerente"}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">
              Descripción
            </label>
            <textarea
              value={project.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:outline-none text-white"
              placeholder="Descripción del proyecto"
              rows="4"
              disabled={user.role !== "gerente"}
            />
          </div>

          {/* Miembros */}
          <div>
            <label className="block text-sm font-medium mb-3 text-white">
              Miembros del proyecto
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((u) => {
                const isSelected = project.members?.some((memberId) => {
                  const numericMemberId =
                    typeof memberId === "string" ? parseInt(memberId, 10) : memberId;
                  const numericUserId =
                    typeof u.id === "string" ? parseInt(u.id, 10) : u.id;
                  return numericMemberId === numericUserId;
                });

                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded border-2 transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                    } ${user.role !== "gerente" ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    onClick={() => user.role === "gerente" && toggleMember(u.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{u.name || u.username}</div>
                        <div className="text-xs opacity-75">{u.role}</div>
                      </div>
                      {isSelected && <div className="text-green-400">✓</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {project.members?.length || 0} miembro(s) seleccionado(s)
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="bg-yellow-500 px-6 py-3 rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              disabled={saving || user.role !== "gerente"}
            >
              {saving ? "Guardando..." : "💾 Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              className="bg-gray-600 px-6 py-3 rounded hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>

            {user.role !== "gerente" && (
              <div className="flex items-center px-4 text-yellow-400 text-sm">
                ⚠️ Solo gerentes pueden editar proyectos
              </div>
            )}
          </div>
        </form>

        {/* Info extra */}
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <h3 className="font-medium mb-2 text-white">Información del proyecto</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>ID: {project.id}</p>
            <p>Miembros: {project.members?.join(", ") || "Ninguno"}</p>
            <p>Última actualización: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
