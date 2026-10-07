import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "El usuario es obligatorio").max(160),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(120, "La contraseña es demasiado larga");

export const activateSchema = z
  .object({
    token: z.string().trim().min(1, "El token es obligatorio"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  username: z.string().trim().min(1, "El correo es obligatorio").max(160),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "El token es obligatorio"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const inviteUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(160),
  username: z.string().trim().email("El correo no es válido").max(160),
  rol: z.enum(["ADMIN", "EMPLEADO"]).default("EMPLEADO"),
});

export const userStatusSchema = z.object({
  estado: z.enum(["ACTIVO", "INACTIVO"]),
});
