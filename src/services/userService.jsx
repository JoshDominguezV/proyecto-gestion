// src/services/userService.js
import api from "./api";

// Función para normalizar usuarios - Ahora el ID siempre será string
const normalizeUser = (user) => ({
  ...user,
  id: user.id.toString() // Convertir a string siempre
});

export const getUsers = async () => {
  const res = await api.get("/users");
  return res.data.map(normalizeUser);
};

export const getUserById = async (id) => {

  const stringId = id.toString();
  
  const res = await api.get(`/users/${stringId}`);
  return normalizeUser(res.data);
};

export const createUser = async (user) => {

  const users = await getUsers();
  

  const maxId = users.reduce((max, u) => {
    const currentId = parseInt(u.id, 10);
    return currentId > max ? currentId : max;
  }, 0);
  

  const newUser = {
    ...user,
    id: (maxId + 1).toString()
  };
  
  const res = await api.post("/users", newUser);
  return normalizeUser(res.data);
};

export const updateUser = async (id, userData) => {
  const stringId = id.toString();
  
  const res = await api.put(`/users/${stringId}`, userData);
  return normalizeUser(res.data);
};

export const deleteUser = async (id) => {
  const stringId = id.toString();
  await api.delete(`/users/${stringId}`);
};