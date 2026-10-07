export type UserRole = "ADMIN" | "EMPLEADO";
export type UserStatus = "PENDIENTE" | "ACTIVO" | "INACTIVO";

export type AuthUser = {
  id: number;
  nombre: string;
  username: string;
  rol: UserRole;
  estado: UserStatus;
  activo: boolean;
};

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    nombre: user.nombre,
    username: user.username,
    rol: user.rol,
    estado: user.estado,
    activo: user.activo,
  };
}
