// src/services/projectService.js
import api from "./api";

// 🔧 Función auxiliar para normalizar un proyecto
const normalizeProject = (project) => ({
  ...project,
  id: project.id, // mantener tal cual (puede ser string o number)
  members: Array.isArray(project.members)
    ? project.members.map(m =>
        typeof m === "string" && !isNaN(m) ? parseInt(m, 10) : m
      )
    : []
});

export const getProjects = async () => {
  try {
    const res = await api.get("/projects");
    console.log("📋 Proyectos obtenidos:", res.data);
    return res.data.map(normalizeProject);
  } catch (error) {
    console.error("❌ Error al obtener proyectos:", error);
    throw error;
  }
};

export const getProjectById = async (id) => {
  try {
    console.log("🔍 Buscando proyecto con ID:", id);

    // Petición directa con el id (string o number)
    const res = await api.get(`/projects/${id}`);
    console.log("✅ Proyecto encontrado:", res.data);

    return normalizeProject(res.data);
  } catch (error) {
    console.error("❌ Error al obtener proyecto por ID:", error);

    if (error.response) {
      console.error("📄 Respuesta del servidor:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }

    throw error;
  }
};

export const createProject = async (project) => {
  try {
    console.log("➕ Creando proyecto (sin ID manual)");

    const newProject = {
      name: project.name,
      description: project.description,
      status: project.status || "active",
      members: Array.isArray(project.members)
        ? project.members.map(m =>
            typeof m === "string" && !isNaN(m) ? parseInt(m, 10) : m
          )
        : [],
      createdAt: new Date().toISOString().split("T")[0] // Solo fecha
    };

    console.log("📤 Enviando proyecto:", newProject);

    const res = await api.post("/projects", newProject);

    console.log("✅ Proyecto creado:", res.data);
    return normalizeProject(res.data);
  } catch (error) {
    console.error("❌ Error al crear proyecto:", error);
    throw error;
  }
};

export const updateProject = async (id, project) => {
  try {
    const formattedProject = normalizeProject(project);

    console.log("✏️ Actualizando proyecto ID:", id, "con datos:", formattedProject);

    const res = await api.put(`/projects/${id}`, formattedProject);

    console.log("✅ Proyecto actualizado:", res.data);
    return normalizeProject(res.data);
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    console.log("🗑️ Eliminando proyecto ID:", id);

    await api.delete(`/projects/${id}`);

    console.log("✅ Proyecto eliminado exitosamente");
  } catch (error) {
    console.error("❌ Error al eliminar proyecto:", error);
    throw error;
  }
};
