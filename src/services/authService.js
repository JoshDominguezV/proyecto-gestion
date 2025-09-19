// src/services/authService.js
import api from "./api";

/**
 * loginUser: devuelve usuario si credenciales coinciden, null si no
 * registerUser: crea usuario (evitar duplicados por username)
 */

export const loginUser = async (username, password) => {
  const res = await api.get(`/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  return res.data[0] || null;
};

export const registerUser = async ({ username, password, role = "usuario" }) => {
  // validar que no exista username
  const exist = await api.get(`/users?username=${encodeURIComponent(username)}`);
  if (exist.data.length > 0) {
    throw new Error("El nombre de usuario ya existe");
  }
  const res = await api.post("/users", { username, password, role });
  return res.data;
};

// devolver usuario sin password para persistencia
export const sanitizeUser = (user) => {
  if (!user) return null;
  const { id, username, role } = user;
  return { id, username, role };
};
