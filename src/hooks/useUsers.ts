import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

// --- Interfaces Alinhadas ---
export interface User {
  id: string; // Garantindo que seja string
  name: string;
  email: string;
  role: 'admin' | 'atendente' | 'proprietario' | 'cliente';
  is_active: boolean | number;
  store_id: string | null; // Adicionado para sumir o erro no usr.store_id
  store_name?: string; 
}

interface UserFormData {
  id: string; // Mudado de number | '' para string para bater com formData.id
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  store_id: string; 
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    id: '', 
    name: '',
    email: '',
    role: 'atendente', 
    is_active: true,
    store_id: '' 
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // No useUsers.ts, dentro de loadUsers
const loadUsers = async () => {
  try {
    setLoading(true);
    const response = await userService.getAll();
    
    // Verifique se a sua API retorna os dados dentro de .data ou direto
    const userList = Array.isArray(response) ? response : (response.data || []);
    
    console.log("Lista de usuários carregada:", userList); // Adicione este log para testar
    setUsers(userList);
  } catch (err) {
    setError('Erro ao carregar');
  } finally {
    setLoading(false);
  }
};

  // Correção do erro no String(user.id) e store_id
  const handleEdit = (user: User) => {
    setFormData({
      id: String(user.id), 
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: Boolean(user.is_active),
      store_id: user.store_id ? String(user.store_id) : '' 
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', role: 'atendente', is_active: true, store_id: '' });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Regra de Negócio: Admin e Cliente não vinculam a loja
    const isGlobalRole = ['cliente', 'admin', 'proprietario'].includes(formData.role);
    const finalStoreId = isGlobalRole ? null : (formData.store_id || null);

    // Validação extra: Atendente deve ter loja
    if (formData.role === 'atendente' && !formData.store_id) {
      alert("Por favor, selecione uma loja para o atendente.");
      return;
    }

    try {
      if (isEditing && formData.id) { // Agora formData.id é string, checamos se não está vazia
        await userService.update(formData.id, {
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active,
          store_id: finalStoreId
        });
        alert('Usuário atualizado!');
      } else {
        await userService.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          store_id: finalStoreId
        });
        alert('Usuário criado!');
      }
      
      resetForm();
      loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar usuário.';
      alert(msg);
    }
  };

  const handleDelete = async (user: User) => {
    const action = user.is_active ? 'desativar' : 'reativar';
    if (!window.confirm(`Deseja realmente ${action} este usuário?`)) return;
    
    try {
      // Usamos String(user.id) para garantir compatibilidade
      await userService.update(String(user.id), { 
        is_active: !user.is_active 
      });
      loadUsers();
    } catch (err) {
      alert('Erro ao processar status.');
    }
  };

  return {
    users, loading, error, formData, setFormData,
    isEditing, handleEdit, handleDelete, handleSubmit, resetForm
  };
}