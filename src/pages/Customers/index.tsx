import { useState } from 'react';
import { UserPlus, Search, Phone, MapPin, Edit2, Loader2 } from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerModal } from './components/CustomerModal';
import { cn } from '../../utils/cn';

export default function Customers() {
  const {
    customers, loading, formData, setFormData, isEditing,
    handleEdit, handleSubmit, resetForm, loadCustomers,
    addContact, removeContact
  } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    loadCustomers(val);
  };

  const openEditModal = async (id: string) => {
    await handleEdit(id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">Gestão de noivas e medidas para locação</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" /> Cadastrar Cliente
        </button>
      </div>

      {/* BUSCA */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-rose-500" 
            value={searchTerm} 
            onChange={e => handleSearch(e.target.value)} 
          />
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
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Nome / CPF</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className={cn(
                    "hover:bg-gray-50 transition-colors",
                    !c.is_active && "bg-gray-50/50 opacity-70"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Indicador visual de status */}
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          c.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" : "bg-gray-400"
                        )} />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{c.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono uppercase">{c.cpf || 'Sem documento'}</p>
                        </div>
                      </div>
                    </td>

                    {/* COLUNA CONTATO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-rose-500" />
                        {c.main_phone || <span className="text-gray-300 italic">Não inf.</span>}
                      </div>
                    </td>

                    {/* COLUNA CIDADE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {c.city || <span className="text-gray-300 italic">Não inf.</span>}
                      </div>
                    </td>

                    {/* COLUNA AÇÕES */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditModal(c.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition-colors bg-gray-50 hover:bg-rose-50 rounded-lg"
                        title="Editar Cliente"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                      Nenhum cliente encontrado para esta busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
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