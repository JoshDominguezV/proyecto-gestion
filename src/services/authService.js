// src/services/authService.js
import api from "./api";

export const loginUser = async (username, password) => {
  const res = await api.get(`/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  const user = res.data[0] || null;
  
  // Verificar si el usuario está activo
  if (user && !user.active) {
    throw new Error("Cuenta pendiente de verificación. Contacte al administrador.");
  }
  
  return user;
};

export const registerUser = async ({ username, password, role = "usuario" }) => {
  // validar que no exista username
  const exist = await api.get(`/users?username=${encodeURIComponent(username)}`);
  if (exist.data.length > 0) {
    throw new Error("El nombre de usuario ya existe");
  }
  
  // Obtener todos los usuarios para generar el próximo ID
  const allUsers = await api.get("/users");
  const maxId = allUsers.data.reduce((max, user) => {
    const idNum = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return idNum > max ? idNum : max;
  }, 0);
  
  // Crear usuario con ID como string y estado inicial inactivo
  const newUser = {
    username,
    password, 
    role,
    active: false, // Inactivo hasta ser verificado por un gerente
    id: (maxId + 1).toString()
  };
  
  const res = await api.post("/users", newUser);
  return res.data;
};

// devolver usuario sin password para persistencia
export const sanitizeUser = (user) => {
  if (!user) return null;
  const id = user.id ? user.id.toString() : user.id;
  const { username, role, active } = user;
  return { id, username, role, active };
};

// Obtener usuarios pendientes de verificación (inactivos)
export const getPendingUsers = async () => {
  const res = await api.get("/users?active=false");
  return res.data;
};

// Actualizar estado de activación de usuario
export const updateUserActivation = async (id, active) => {
  // Primero obtener el usuario actual
  const userRes = await api.get(`/users/${id}`);
  const currentUser = userRes.data;
  
  // Actualizar solo el campo active
  const updatedUser = {
    ...currentUser,
    active: active
  };
  
  const res = await api.put(`/users/${id}`, updatedUser);
  return res.data;
};