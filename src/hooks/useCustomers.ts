import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';
import type { Customer, Contact, Address } from '../types/customer';
import { toast } from 'react-hot-toast';

export function useCustomers() {
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
    contacts: [{ type: 'whatsapp', value: '', is_primary: 1 }],
    addresses: [{ 
      type: 'residential', label: 'Principal', zip_code: '', 
      street: '', number: '', neighborhood: '', city: '', state: '', is_default: 1 
    }]
  };

  const [formData, setFormData] = useState<Partial<Customer>>(initialFormState);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const data = await customerService.getAll(search);
      setCustomers(data);
    } catch (err: any) {
      console.error('Erro ao carregar clientes', err);
      toast.error('Não foi possível carregar a lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  // --- Funções Auxiliares para Listas Dinâmicas ---

  const addContact = () => {
    const newContact: Contact = { type: 'whatsapp', value: '', is_primary: 0 };
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
    } catch (err: any) {
      toast.error('Erro ao carregar detalhes da cliente.', { id: loadToast });
    }
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
      await customerService.create(formData);
      toast.success('Sucesso!', { id: loadingToast });
    }

    resetForm();
    await loadCustomers(); 
    
    return true; 
    
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Erro ao salvar.';
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
    addContact, removeContact, addAddress, removeAddress
  };
}