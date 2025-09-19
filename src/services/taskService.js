// src/services/taskService.js
import api from "./api";

export const getTasks = async () => {
  const res = await api.get("/tasks");
  return res.data;
};

export const getTasksByProject = async (projectId) => {
  const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
  const res = await api.get(`/tasks?projectId=${numericProjectId}`);
  return res.data;
};

export const getTaskById = async (id) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const res = await api.get(`/tasks/${numericId}`);
  return res.data;
};

export const createTask = async (task) => {
  const res = await api.post("/tasks", task);
  return res.data;
};



// export const createTask = async (task) => {
//   const tasks = await getTasks();
//   const maxId = tasks.reduce((max, t) => Math.max(max, typeof t.id === 'number' ? t.id : parseInt(t.id, 10)), 0);
  
//   const newTask = {
//     ...task,
//     id: maxId + 1
//   };
  
//   const res = await api.post("/tasks", newTask);
//   return res.data;
// };

export const updateTask = async (id, task) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const res = await api.put(`/tasks/${numericId}`, task);
  return res.data;
};

export const deleteTask = async (id) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  await api.delete(`/tasks/${numericId}`);
};