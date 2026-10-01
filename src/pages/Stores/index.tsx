import { useEffect, useState } from "react";
import {
  Search,
  Edit2,
  Building2,
  MapPin,
  Phone,
  X,
  Filter,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useStores } from "../../hooks/useStores";
import { cn } from "../../utils/cn";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import { StoreModal } from "./components/StoreModal";
import { toast } from "react-hot-toast";
import type { Store } from "../../services/storeService";

function Stores() {
  const {
    stores,
    formData,
    setFormData,
    isEditing,
    handleEdit,
    handleToggleActive,
    handleSubmit,
    resetForm,
  } = useStores();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmStoreId, setConfirmStoreId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'activate' | 'deactivate' | null>(null);

  // Filtro de pesquisa e status
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const isActive = s.is_active === true || s.is_active === 1;
    const matchesStatus = showInactive ? true : isActive;

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatusClick = (store: any) => {
    const isActive = store.is_active === true || store.is_active === 1;
    setConfirmAction(isActive ? 'deactivate' : 'activate');
    setConfirmStoreId(String(store.id));
    setIsConfirmOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmStoreId || !confirmAction) return;
    
    try {
      await handleToggleActive(confirmStoreId);
      toast.success(
        confirmAction === 'deactivate' 
          ? 'Loja inativada com sucesso' 
          : 'Loja ativada com sucesso'
      );
    } catch (err) {
      toast.error('Erro ao alterar status da loja');
    } finally {
      setIsConfirmOpen(false);
      setConfirmStoreId(null);
      setConfirmAction(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    handleEdit(store);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Lojas
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie as lojas da rede.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 w-full sm:w-auto"
        >
          <Building2 className="w-5 h-5" />
          Nova Loja
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou endereço..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4 px-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Mostrar Inativas
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
                  Loja
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Endereço / Contato
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStores.map((store) => {
                const isActive = store.is_active === true || store.is_active === 1;
                return (
                  <tr
                    key={store.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      !isActive && "opacity-60 bg-gray-50/50"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold uppercase">
                          {store.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {store.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {store.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{store.address || 'Endereço não cadastrado'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{store.phone || 'Telefone não cadastrado'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border",
                        isActive 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-red-100 text-red-700 border-red-200"
                      )}>
                        {isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(store)}
                          title="Editar Loja"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatusClick(store)}
                          title={isActive ? "Inativar Loja" : "Ativar Loja"}
                          className="p-2 rounded-lg text-gray-400 transition-all active:scale-90"
                          style={{
                            color: isActive ? undefined : '#22c55e',
                            backgroundColor: isActive ? undefined : '#f0fdf4',
                          }}
                        >
                          {isActive ? (
                            <ToggleLeft className="w-4 h-4 text-red-500" />
                          ) : (
                            <ToggleRight className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'Nenhuma loja encontrada para esta busca' : 'Nenhuma loja cadastrada'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Novo componente StoreModal */}
      <StoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={async (e) => {
          return await handleSubmit(e);
        }}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setConfirmStoreId(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmToggle}
        title={confirmAction === 'deactivate' ? 'Inativar Loja' : 'Ativar Loja'}
        description={
          confirmAction === 'deactivate'
            ? 'Tem certeza que deseja inativar esta loja? Ela não aparecerá mais nas listagens ativas.'
            : 'Tem certeza que deseja ativar esta loja? Ela voltará a aparecer nas listagens ativas.'
        }
        confirmText={confirmAction === 'deactivate' ? 'Inativar' : 'Ativar'}
        variant={confirmAction === 'deactivate' ? 'danger' : 'warning'}
      />
    </div>
  );
}

export default Stores;