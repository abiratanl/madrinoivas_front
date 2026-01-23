import { useState } from 'react';
import { UserPlus, Search, Phone, MapPin, Edit2, Loader2, Trash, RotateCcw } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerModal } from './components/CustomerModal';
import { cn } from '../../utils/cn';
import { ActionButton } from '../../components/common/ActionButton';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export default function Customers() {
  const {
    customers, deleteCustomer, toggleCustomerStatus, loading, formData, setFormData, isEditing,
    handleEdit, handleSubmit, resetForm, loadCustomers,
    addContact, removeContact
  } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para o Modal de Confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    loadCustomers(val);
  };

  const openEditModal = async (id: string) => {
    await handleEdit(id);
    setIsModalOpen(true);
  };

  // Funções de Exclusão
  const openDeleteConfirm = (id: string) => {
    setCustomerToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete); // Esta função faz o softDelete e limpa o estado
      setCustomerToDelete(null);
    }
  };

  const [showInactives, setShowInactives] = useState(false);

  // Atualizamos o handleSearch para considerar o filtro de status
  const handleToggleInactives = () => {
    const newValue = !showInactives;
    setShowInactives(newValue);

    // Se o seu loadCustomers aceitar filtros de status, enviamos aqui
    // Caso contrário, o filtro pode ser feito no frontend ou enviando para a API
    loadCustomers(searchTerm, newValue);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">Gerencie cadastros, medidas e históricos.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      {/* BUSCA E FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>

        {/* Toggle de Inativos Funcional */}
        <div className="hidden md:flex items-center gap-3 px-4 border-l border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Mostrar Inativos
          </span>
          <button
            onClick={handleToggleInactives}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out outline-none",
              showInactives ? "bg-rose-600" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm",
              showInactives ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="font-medium">Carregando clientes...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5">Contato / Localização</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm border border-rose-100">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-rose-600 transition-colors">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.cpf || 'CPF não informado'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" /> {c.main_phone || '(00) 00000-0000'}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {c.city || 'Cidade não inf.'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter",
                        c.is_active
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                      )}>
                        {c.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {/* BOTÃO EDITAR */}
                            <ActionButton
                              icon={Edit2}
                              variant="primary"
                              onClick={() => openEditModal(c.id)}
                              title="Editar Cliente"
                            />

                            {/* BOTÃO ALTERNAR STATUS (ATIVAR/INATIVAR) */}
                            <ActionButton
                              icon={RotateCcw}
                              variant="ghost"
                              onClick={() => toggleCustomerStatus(c.id, !!c.is_active)}
                              title={c.is_active ? "Inativar Cliente" : "Ativar Cliente"}
                              className={cn(
                                c.is_active ? "hover:text-amber-600 hover:bg-amber-50" : "hover:text-green-600 hover:bg-green-50"
                              )}
                            />

                            {/* BOTÃO EXCLUIR */}
                            <ActionButton
                              icon={Trash}
                              variant="danger"
                              onClick={() => openDeleteConfirm(c.id)}
                              title="Excluir Cliente"
                            />
                          </div>
                        </td>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPONENTES DE MODAL (FORA DA TABELA) */}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        description="Tem certeza que deseja remover este cadastro? Todos os dados de medidas e histórico associados serão ocultados."
        confirmText="Sim, Excluir"
      />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        addContact={addContact}
        removeContact={removeContact}
      />
    </div>
  );
}