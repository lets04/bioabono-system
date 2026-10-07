import { useState } from "react";
import { Mail, Plus, Power, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const usersQuery = useUsers();
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: (payload: UserInvitePayload) => usersApi.invite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreating(false);
      setFormError("");
    },
    onError: (error) => setFormError(error instanceof Error ? error.message : "No se pudo invitar"),
  });

  const resendMutation = useMutation({
    mutationFn: (id: number) => usersApi.resendInvitation(id),
    onSuccess: (result) => {
      alert(result.emailEnviado ? "Invitación reenviada" : "Invitación regenerada. Revisa la consola del backend si SMTP no está configurado.");
    },
    onError: (error) => alert(error instanceof Error ? error.message : "No se pudo reenviar"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: "ACTIVO" | "INACTIVO" }) => usersApi.patchStatus(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (error) => alert(error instanceof Error ? error.message : "No se pudo cambiar el estado"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (error) => alert(error instanceof Error ? error.message : "No se pudo eliminar el usuario"),
  });

  const users = usersQuery.data ?? [];

  const confirmStatus = (user: SystemUser) => {
    if (user.estado === "PENDIENTE") return;
    const next = user.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const action = next === "INACTIVO" ? "desactivar" : "reactivar";
    if (!confirm(`¿Confirmas ${action} a "${user.nombre}"?`)) return;
    statusMutation.mutate({ id: user.id, estado: next });
  };

  const confirmDelete = (user: SystemUser) => {
    if (user.id === currentUser?.id) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (!confirm(`¿Eliminar definitivamente a "${user.nombre}"? Esta acción no se puede deshacer.`)) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-500">Solo el administrador puede invitar usuarios. El empleado crea su propia contraseña.</p>
        <button onClick={() => setCreating(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-bio-green px-4 text-sm font-semibold text-white hover:bg-bio-dark">
          <Plus size={17} />
          Invitar usuario
        </button>
      </div>

      <DataState isLoading={usersQuery.isLoading} isError={usersQuery.isError} />

      {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
        <EmptyState text="Invita al primer empleado para que active su cuenta." />
      ) : null}

      {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium text-bio-dark">{user.nombre}</td>
                    <td className="px-4 py-3 text-stone-600">{user.username}</td>
                    <td className="px-4 py-3">{user.rol}</td>
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
                          <IconButton label={user.estado === "ACTIVO" ? "Desactivar" : "Reactivar"} onClick={() => confirmStatus(user)} icon={Power} />
                        )}
                        {user.id !== currentUser?.id ? (
                          <IconButton label="Eliminar usuario" onClick={() => confirmDelete(user)} icon={Trash2} />
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
        <Modal title="Invitar usuario" onClose={() => { setCreating(false); setFormError(""); }}>
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
