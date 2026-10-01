import { useEffect, useState } from "react";
import {
  UserPlus,
  Search,
  Edit2,
  Shield,
  User as UserIcon,
  Store,
  X,
  Filter,
  Crown,
  UserX,
  UserCheck,
} from "lucide-react";
import { useUsers, type User } from "../../hooks/useUsers";
import { api } from "../../services/api";
import { cn } from "../../utils/cn";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { toast } from "react-hot-toast";

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  owner: 'Proprietário',
  attendant: 'Atendente',
  customer: 'Cliente',
};

interface StoreData {
  id: string;
  name: string;
}

function Users() {
  const {
    users,
    formData,
    setFormData,
    isEditing,
    handleEdit,
    handleToggleStatus,
    handleSubmit,
    resetForm,
  } = useUsers();

  const [stores, setStores] = useState<StoreData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);

  // Carrega as lojas para o Select do formulário
  useEffect(() => {
    async function loadStores() {
      try {
        const response = await api.get("/stores");
        // Ajuste conforme a estrutura da sua API
        setStores(response.data.data || response.data);
      } catch (err) {
        console.error("Erro ao carregar lojas", err);
      }
    }
    loadStores();
  }, []);

  const handleToggleStatusClick = (user: User) => {
    const isActive = user.is_active === true || user.is_active === 1;
    setConfirmAction(isActive ? 'deactivate' : 'activate');
    setConfirmUserId(String(user.id));
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmUserId || !confirmAction) return;
    
    try {
      await handleToggleStatus(confirmUserId);
      toast.success(
        confirmAction === 'deactivate' 
          ? 'Usuário inativado com sucesso' 
          : 'Usuário ativado com sucesso'
      );
    } catch {
      toast.error('Erro ao alterar status do usuário');
    } finally {
      setIsConfirmOpen(false);
      setConfirmUserId(null);
      setConfirmAction(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    handleEdit(user);
    setIsModalOpen(true);
  };

  // Filtro de pesquisa e status
  const filteredUsers = users.filter((u: User) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Se o backend enviar deleted_at, filtramos para não mostrar excluídos no grid principal
    // @ts-expect-error - deleted_at may not exist in User type
    if (u.deleted_at) return false;

    const isActive = u.is_active === true || u.is_active === 1;
    const matchesStatus = showInactive ? true : isActive;

    return matchesSearch && matchesStatus;
  });



  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Usuários
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie acessos, suspensões e exclusões.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 w-full sm:w-auto"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4 px-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Mostrar Inativos
          </label>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              "w-11 h-6 rounded-full p-1 transition-colors duration-200",
              showInactive ? "bg-rose-500" : "bg-gray-300",
            )}
          >
            <div
              className={cn(
                "bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200",
                showInactive ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Perfil / Loja
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isActive = user.is_active === true || user.is_active === 1;
                return (
                  <tr
                    key={user.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      !isActive && "opacity-60 bg-gray-50/50"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 font-medium capitalize text-gray-700">
                          {user.role === "admin" && <Shield className="w-3.5 h-3.5 text-rose-500" />}
                          {user.role === "owner" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          {user.role === "attendant" && <UserIcon className="w-3.5 h-3.5 text-blue-500" />}
                          {user.role === "customer" && <UserIcon className="w-3.5 h-3.5 text-gray-400" />}
                          {roleLabels[user.role] || user.role}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Store className="w-3 h-3" />
                          {
                            ['admin', 'owner', 'customer'].includes(user.role.toLowerCase())
                              ? "Geral"
                              : (
                                stores.find(s => s.id === user.store_id)?.name || "Loja não definida"
                              )
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          title="Editar Usuário"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatusClick(user)}
                          title={isActive ? "Inativar Usuário" : "Ativar Usuário"}
                          className="p-2 rounded-lg text-gray-400 transition-all active:scale-90"
                          style={{
                            color: isActive ? undefined : '#22c55e',
                            backgroundColor: isActive ? undefined : '#f0fdf4',
                          }}
                        >
                          {isActive ? (
                            <UserX className="w-4 h-4 text-red-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-600 p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">
                {isEditing ? "Editar Perfil" : "Cadastrar Usuário"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:rotate-90 transition-transform"
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                handleSubmit(e);
                setIsModalOpen(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nome Completo
                </label>
                <input
                  required
                  type="text"
                  className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  E-mail
                </label>
                <input
                  required
                  type="email"
                  disabled={isEditing}
                  className={cn(
                    "w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all",
                    isEditing && "bg-gray-50 text-gray-400",
                  )}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Perfil
                  </label>
                  <select
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="attendant">Atendente</option>
                    <option value="admin">Administrador</option>
                    <option value="owner">Proprietário</option>
                    <option value="customer">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Loja Vínculo
                  </label>
                  <select
                    required={formData.role === "attendant"}
                    disabled={["customer", "admin", "owner"].includes(
                      formData.role,
                    )}
                    className={cn(
                      "w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white transition-all",
                      ["customer", "admin", "owner"].includes(
                        formData.role,
                      ) && "bg-gray-100 cursor-not-allowed opacity-60",
                    )}
                    value={
                      ["customer", "admin", "owner"].includes(
                        formData.role,
                      )
                        ? ""
                        : formData.store_id
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, store_id: e.target.value })
                    }
                  >
                    <option value="">Geral / Sem Vínculo</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="active_check"
                    className="w-4 h-4 accent-rose-600"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="active_check"
                    className="text-sm font-medium text-gray-700"
                  >
                    Conta Ativa (is_active)
                  </label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold transition-colors hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-transform active:scale-95"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setConfirmUserId(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmToggle}
        title={confirmAction === 'deactivate' ? 'Inativar Usuário' : 'Ativar Usuário'}
        description={
          confirmAction === 'deactivate'
            ? 'Tem certeza que deseja inativar este usuário? Ele não poderá mais acessar o sistema.'
            : 'Tem certeza que deseja ativar este usuário? Ele terá acesso ao sistema novamente.'
        }
        confirmText={confirmAction === 'deactivate' ? 'Inativar' : 'Ativar'}
        variant={confirmAction === 'deactivate' ? 'danger' : 'warning'}
      />
    </div>
  );
}

export default Users;
