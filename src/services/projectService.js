// src/services/projectService.js
import api from "./api";

// 🔧 Función auxiliar para normalizar un proyecto
const normalizeProject = (project) => ({
  ...project,
  id: typeof project.id === "string" ? parseInt(project.id, 10) : project.id,
  members: Array.isArray(project.members)
    ? project.members.map(m => (typeof m === "string" ? parseInt(m, 10) : m))
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
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    
    console.log("🔍 Buscando proyecto con ID:", id, "→", numericId);

    if (isNaN(numericId)) {
      throw new Error(`ID inválido: ${id}`);
    }

    console.log("📡 Haciendo petición a:", `/projects/${numericId}`);
    const res = await api.get(`/projects/${numericId}`);
    
    console.log("✅ Proyecto obtenido:", res.data);
    return normalizeProject(res.data);
    
  } catch (error) {
    console.error("❌ Error al obtener proyecto por ID:", error);
    
    // Información adicional para debugging
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
    // Obtener todos los proyectos actuales para calcular el próximo ID
    const projects = await getProjects();
    
    // Calcular el próximo ID numérico secuencial
    const nextId = projects.length > 0 
      ? Math.max(...projects.map(p => parseInt(p.id) || 0)) + 1 
      : 1;

    console.log("➕ Creando proyecto con ID:", nextId);

    // Crear el proyecto con ID explícito
    const newProject = {
      id: nextId,
      name: project.name,
      description: project.description,
      status: project.status || "active",
      members: Array.isArray(project.members) 
        ? project.members.map(m => (typeof m === "string" ? parseInt(m, 10) : m))
        : [],
      createdAt: new Date().toISOString().split('T')[0], // Solo fecha: "2025-09-19"
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
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      throw new Error(`ID inválido: ${id}`);
    }

    const formattedProject = normalizeProject(project);
    
    console.log("✏️ Actualizando proyecto ID:", numericId, "con datos:", formattedProject);

    const res = await api.put(`/projects/${numericId}`, formattedProject);
    
    console.log("✅ Proyecto actualizado:", res.data);
    return normalizeProject(res.data);
    
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(numericId)) {
      throw new Error(`ID inválido: ${id}`);
    }

    console.log("🗑️ Eliminando proyecto ID:", numericId);
    
    await api.delete(`/projects/${numericId}`);
    
    console.log("✅ Proyecto eliminado exitosamente");
    
  } catch (error) {
    console.error("❌ Error al eliminar proyecto:", error);
    throw error;
  }
};