// src/services/api.js
import axios from 'axios';
import { normalizeData } from './normalizeService';

const API_BASE_URL = 'https://fake-api-4csu.vercel.app/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptar respuestas para normalizar datos
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = normalizeData(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- Proyectos ---
export const getProjects = () => api.get("/projects");
export const createProject = (data) => api.post("/projects", data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// --- Tareas ---
export const getTasks = () => api.get("/tasks");
export const createTask = (data) => api.post("/tasks", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// ✅ Exportar también el cliente Axios por defecto
export default api;
