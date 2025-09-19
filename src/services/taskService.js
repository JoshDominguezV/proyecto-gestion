// src/services/taskService.js
import api from "./api";

// 🔧 Normalizar tarea
const normalizeTask = (task) => ({
  ...task,
  id: task.id, // puede ser string o number
  projectId: task.projectId // mantener tal cual (puede ser string o number)
});

export const getTasks = async () => {
  const res = await api.get("/tasks");
  console.log("📋 Tareas obtenidas:", res.data);
  return res.data.map(normalizeTask);
};

export const getTasksByProject = async (projectId) => {
  console.log("🔍 Buscando tareas del proyecto:", projectId);
  // Pasamos el projectId tal cual, no lo forzamos a number
  const res = await api.get(`/tasks?projectId=${projectId}`);
  return res.data.map(normalizeTask);
};

export const getTaskById = async (id) => {
  console.log("🔍 Buscando tarea con ID:", id);
  const res = await api.get(`/tasks/${id}`);
  return normalizeTask(res.data);
};

export const createTask = async (task) => {
  console.log("➕ Creando tarea:", task);
  const res = await api.post("/tasks", task);
  console.log("✅ Tarea creada:", res.data);
  return normalizeTask(res.data);
};

// Si quisieras forzar IDs numéricos secuenciales, puedes usar la versión comentada.
// Pero por ahora dejamos que json-server genere el ID (string o number).

export const updateTask = async (id, task) => {
  console.log("✏️ Actualizando tarea ID:", id, "con datos:", task);
  const res = await api.put(`/tasks/${id}`, task);
  console.log("✅ Tarea actualizada:", res.data);
  return normalizeTask(res.data);
};

export const deleteTask = async (id) => {
  console.log("🗑️ Eliminando tarea ID:", id);
  await api.delete(`/tasks/${id}`);
  console.log("✅ Tarea eliminada exitosamente");
};
