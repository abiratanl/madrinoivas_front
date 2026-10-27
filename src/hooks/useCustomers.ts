import { useState, useEffect, useCallback } from 'react';
import { customerService } from '../services/customerService';
import type { Customer, Contact, Address } from '../types/customer';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export function useCustomers() {
  const { selectedStore, user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Estado inicial do formulário seguindo a estrutura do Backend
  const initialFormState: Partial<Customer> = {
    name: '',
    rg: '',
    cpf: '',
    birth_date: '',
    notes: '',
    measurements: {
      busto: '',
      cintura: '',
      quadril: '',
      altura: '',
    },
    contacts: [{ type: 'whatsapp', value: '', is_primary: 1, is_active: true }],
    addresses: [{ 
      type: 'residential', label: 'Principal', zip_code: '', 
      street: '', number: '', neighborhood: '', city: '', state: '', is_default: 1 
    }]
  };

  const [formData, setFormData] = useState<Partial<Customer>>(initialFormState);

  const loadCustomers = useCallback(
    async (search?: string, includeInactives: boolean = false) => {
      setLoading(true);
      try {
        const data = await customerService.getAll(search, includeInactives);
        setCustomers(data);
      } catch {
        toast.error('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // --- Funções Auxiliares para Listas Dinâmicas ---

  const addContact = () => {
    const newContact: Contact = { type: 'whatsapp', value: '', is_primary: 0, is_active: true };
    setFormData(prev => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts?.filter((_, i) => i !== index)
    }));
  };

  const addAddress = () => {
    const newAddress: Address = { 
      type: 'residential', label: '', zip_code: '', street: '', 
      number: '', neighborhood: '', city: '', state: '', is_default: 0 
    };
    setFormData(prev => ({
      ...prev,
      addresses: [...(prev.addresses || []), newAddress]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses?.filter((_, i) => i !== index)
    }));
  };

  // --- Ações de Formulário ---

  const handleEdit = async (id: string) => {
    const loadToast = toast.loading('Carregando dados da cliente...');
    try {
      const fullCustomer = await customerService.getById(id);
      setFormData(fullCustomer);
      setIsEditing(true);
      toast.dismiss(loadToast);
    } catch {
      toast.error('Erro ao carregar detalhes da cliente.', { id: loadToast });
    }
  };

  const toggleCustomerStatus = async (id: string, currentStatus: boolean) => {
  try {
    const newStatus = !currentStatus;
    // O hook gerencia a chamada ao service
    const success = await customerService.update(id, { is_active: newStatus });
    
    if (success) {
      // O hook gerencia a atualização da lista local
      await loadCustomers(); 
      toast.success(newStatus ? 'Cliente ativado!' : 'Cliente inativado!');
      return true;
    }
  } catch (error) {
    console.error(error);
    toast.error('Erro ao alterar status.');
  }
  return false;
};

  const deleteCustomer = async (id: string) => {
  try {
    const response = await customerService.softDelete(id); 
    if (response) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente removido com sucesso!');
      return true;
    }
  } catch {
    toast.error('Erro ao excluir cliente.');
    return false;
  }
  return false;
};

  const handleSubmit = async (e: React.FormEvent, step?: number): Promise<boolean> => { // <-- Adicione : Promise<boolean>
  if (e) e.preventDefault();

  if (step !== undefined && step < 3) return false;

  const loadingToast = toast.loading(isEditing ? 'Atualizando...' : 'Criando...');    

  try {
    if (isEditing && formData.id) {
      await customerService.update(formData.id, formData);
      toast.success('Sucesso!', { id: loadingToast });
    } else {
      const storeId = formData.store_id || selectedStore?.id || user?.store_id;
      await customerService.create({ ...formData, store_id: storeId });
      toast.success('Sucesso!', { id: loadingToast });
    }

    resetForm();
    await loadCustomers(); 
    
    return true; 
    
  } catch (err) {
    const apiError = err as { response?: { data?: { message?: string } } };
    const errorMessage = apiError.response?.data?.message || 'Erro ao salvar.';
    toast.error(errorMessage, { id: loadingToast });
    return false; 
  }
};
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  return {
    customers, loading, formData, setFormData, isEditing,
    handleEdit, handleSubmit, resetForm, loadCustomers,
    addContact, removeContact, addAddress, removeAddress,
    deleteCustomer, toggleCustomerStatus
  };

  
}