// src/services/userService.js
import api from "./api";

// Función para normalizar usuarios
const normalizeUser = (user) => ({
  ...user,
  id: typeof user.id === "string" ? parseInt(user.id, 10) : user.id
});

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.map(normalizeUser);
};

export const getUserById = async (id) => {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  
  if (isNaN(numericId)) {
    throw new Error(`ID inválido: ${id}`);
  }
  
  const res = await api.get(`/users/${numericId}`);
  return normalizeUser(res.data);
};

export const createUser = async (user) => {
  const users = await getUsers();
  const maxId = users.reduce((max, u) => (u.id > max ? u.id : max), 0);
  
  const newUser = normalizeUser({
    ...user,
    id: maxId + 1
  });
  
  const res = await api.post("/users", newUser);
  return normalizeUser(res.data);
};