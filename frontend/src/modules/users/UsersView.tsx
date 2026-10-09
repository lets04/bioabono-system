import { useState } from "react";
import { Mail, Plus, Power, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFeedback } from "../../components/ui/Feedback";
import { Modal } from "../../components/ui/Modal";
import { DataState } from "../../components/ui/DataState";
import { EmptyState } from "../../components/ui/EmptyState";
import { IconButton } from "../../components/ui/IconButton";
import { usersApi } from "../../api/users";
import { useUsers } from "../../hooks/useUsers";
import { UserForm } from "./UserForm";
import type { SystemUser, UserInvitePayload, UserStatus } from "../../types";
import { useAuth } from "../../auth/AuthContext";

function statusClass(estado: UserStatus) {
  if (estado === "ACTIVO") return "bg-emerald-100 text-emerald-800";
  if (estado === "PENDIENTE") return "bg-amber-100 text-amber-800";
  return "bg-stone-200 text-stone-600";
}

export function UsersView() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { notify, confirm } = useFeedback();
  const usersQuery = useUsers();
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: (payload: UserInvitePayload) => usersApi.invite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify("Invitación enviada");
      setCreating(false);
      setFormError("");
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : "No se pudo invitar"),
  });

  const resendMutation = useMutation({
    mutationFn: (id: number) => usersApi.resendInvitation(id),
    onSuccess: (result) => {
      notify(result.emailEnviado ? "Invitación reenviada" : "Invitación regenerada. Revisa la consola del backend si SMTP no está configurado.", result.emailEnviado ? "success" : "info");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo reenviar", "error"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: "ACTIVO" | "INACTIVO" }) => usersApi.patchStatus(id, estado),
    onSuccess: (_result, vars) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify(vars.estado === "ACTIVO" ? "Usuario reactivado" : "Usuario desactivado");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo cambiar el estado", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notify("Usuario eliminado");
    },
    onError: (error) => notify(error instanceof Error ? error.message : "No se pudo eliminar el usuario", "error"),
  });

  const users = usersQuery.data ?? [];

  const confirmStatus = async (user: SystemUser) => {
    if (user.estado === "PENDIENTE") return;
    const next = user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const action = next === "INACTIVO" ? "desactivar" : "reactivar";
    const ok = await confirm({
      title: `¿${action[0].toUpperCase()}${action.slice(1)} a "${user.nombre}"?`,
      message: next === "INACTIVO" ? "No podrá iniciar sesión hasta que lo reactives." : undefined,
      confirmLabel: action[0].toUpperCase() + action.slice(1),
      tone: next === "INACTIVO" ? "danger" : "default",
    });
    if (!ok) return;
    statusMutation.mutate({ id: user.id, estado: next });
  };

  const confirmDelete = async (user: SystemUser) => {
    if (user.id === currentUser?.id) {
      notify("No puedes eliminar tu propia cuenta.", "error");
      return;
    }
    const ok = await confirm({
      title: `¿Eliminar a "${user.nombre}"?`,
      message: "Esta acción es permanente y no se puede deshacer.",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">Solo el administrador puede invitar usuarios. El empleado crea su propia contraseña.</p>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus size={17} />
          Invitar usuario
        </button>
      </div>

      <DataState isLoading={usersQuery.isLoading} isError={usersQuery.isError} />

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <div className="table-card">
          <EmptyState text="Aún no hay usuarios invitados." hint="Invita al primer empleado para que active su cuenta." />
        </div>
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
        <div className="table-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="table-body divide-y divide-stone-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-bio-dark">{user.nombre}</td>
                    <td className="px-4 py-3 text-stone-600">{user.username}</td>
                    <td className="px-4 py-3">{user.rol === "ADMIN" ? "Administrador" : "Empleado"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(user.estado)}`}>
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {user.estado === "PENDIENTE" ? (
                          <IconButton label="Reenviar invitación" onClick={() => resendMutation.mutate(user.id)} icon={Mail} />
                        ) : (
                          <IconButton label={user.estado === "ACTIVO" ? "Desactivar" : "Reactivar"} onClick={() => void confirmStatus(user)} icon={Power} tone={user.estado === "ACTIVO" ? "danger" : "default"} />
                        )}
                        {user.id !== currentUser?.id ? (
                          <IconButton label="Eliminar usuario" onClick={() => void confirmDelete(user)} icon={Trash2} tone="danger" />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {creating ? (
        <Modal size="sm" title="Invitar usuario" description="Recibirá un correo para crear su contraseña." onClose={() => { setCreating(false); setFormError(""); }}>
          <UserForm
            error={formError}
            isSubmitting={inviteMutation.isPending}
            onSubmit={(payload) => inviteMutation.mutate(payload)}
          />
        </Modal>
      ) : null}
    </div>
  );
}
