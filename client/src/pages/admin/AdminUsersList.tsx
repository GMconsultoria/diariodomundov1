import { trpc } from "@/lib/trpc";
import { Loader2, Shield, User, Edit2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsersList() {
  const { data: users, isLoading, refetch } = trpc.admin.users.getAll.useQuery();
  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Cargo atualizado com sucesso!");
      refetch();
    }
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [pendingRole, setPendingRole] = useState<"admin" | "editor" | "reader" | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  const handleUpdateRole = async (userId: number) => {
    if (!pendingRole) {
      setEditingId(null);
      return;
    }
    await updateRoleMutation.mutateAsync({ userId, role: pendingRole });
    setEditingId(null);
    setPendingRole(null);
  };

  const startEditing = (user: any) => {
    setEditingId(user.id);
    setPendingRole(user.role);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold mb-2">Usuários</h1>
        <p className="text-muted-foreground">Gerencie as permissões de acesso ao portal</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="py-4 px-6 font-semibold text-sm">Usuário</th>
              <th className="py-4 px-6 font-semibold text-sm">E-mail</th>
              <th className="py-4 px-6 font-semibold text-sm">Cargo</th>
              <th className="py-4 px-6 font-semibold text-sm">Desde</th>
              <th className="py-4 px-6 font-semibold text-sm text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                      {user.role === "admin" ? <Shield size={20} /> : <User size={20} />}
                    </div>
                    <span className="font-semibold">{user.name || "Sem Nome"}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-muted-foreground text-sm">{user.email || "N/A"}</td>
                <td className="py-4 px-6">
                  {editingId === user.id ? (
                    <select
                      className="bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      value={pendingRole || user.role}
                      onChange={(e) => setPendingRole(e.target.value as any)}
                    >
                      <option value="admin">Administrador</option>
                      <option value="editor">Redator</option>
                      <option value="reader">Leitor</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin" ? "bg-red-100 text-red-700" :
                      user.role === "editor" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {user.role === "admin" ? "Administrador" : 
                       user.role === "editor" ? "Redator" : "Leitor"}
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => editingId === user.id ? handleUpdateRole(user.id) : startEditing(user)}
                    disabled={updateRoleMutation.isPending}
                    className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-accent disabled:opacity-50"
                  >
                    {editingId === user.id ? (
                      updateRoleMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} className="text-green-600" />
                    ) : <Edit2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
