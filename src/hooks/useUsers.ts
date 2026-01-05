import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

// 1. INTERFACE USER: Reflete o Banco de Dados (MySQL / Soft Delete)
export interface User {
  id: string; 
  name: string;
  email: string;
  role: 'admin' | 'atendente' | 'proprietario' | 'cliente';
  is_active: boolean | number; // MySQL retorna 1/0
  store_id: string | null; 
  store_name?: string; 
}

interface UserFormData {
  id: string; 
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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      const userList = Array.isArray(response) ? response : (response.data || []);
      setUsers(userList);
    } catch (err) {
      setError('Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  // 2. EDIÇÃO: Carrega os dados no formulário (independente de estar ativo ou não)
  const handleEdit = (user: User) => {
    setFormData({
      id: String(user.id), 
      name: user.name,
      email: user.email,
      role: user.role,
      // Normaliza para booleano para o checkbox/toggle do front
      is_active: user.is_active === true || user.is_active === 1,
      store_id: user.store_id ? String(user.store_id) : '' 
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', email: '', role: 'atendente', is_active: true, store_id: '' });
    setIsEditing(false);
  };

  const softDeleteUser = async (user: User) => {
  if (!window.confirm(`AVISO: Operação crítica! Deseja REALMENTE EXCLUIR permanentemente o usuário ${user.name}?`)) return;
  
  try {
    // Chama o método delete do service (Soft Delete no backend)
    await userService.delete(user.id); 
    alert('Usuário excluído com sucesso!');
    loadUsers(); // Recarrega a lista para ele sumir do grid
  } catch (err) {
    alert('Erro ao excluir usuário.');
  }
};

  // 3. SUBMISSÃO: Validações e Regras de Loja
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Regra: Perfis globais não vinculam loja no banco
    const isGlobalRole = ['cliente', 'admin', 'proprietario'].includes(formData.role);
    const finalStoreId = isGlobalRole ? null : (formData.store_id || null);

    // Trava de segurança: Atendente deve ter loja obrigatoriamente
    if (formData.role === 'atendente' && !formData.store_id) {
      alert("Por favor, selecione uma loja para o atendente.");
      return;
    }

    try {
      if (isEditing && formData.id) {
        // UPDATE: Enviamos apenas o necessário (sem e-mail para evitar erro de duplicidade)
        await userService.update(formData.id, {
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active,
          store_id: finalStoreId
        });
        alert('Usuário atualizado com sucesso!');
      } else {
        // CREATE: Envio completo
        await userService.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          store_id: finalStoreId
        });
        alert('Usuário criado com sucesso!');
      }
      
      resetForm();
      loadUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao salvar usuário.';
      alert(msg);
    }
  };

  // 4. MUDANÇA DE STATUS: Alterna entre Ativo/Inativo (Soft Delete no Back)
  const handleDelete = async (user: User) => {
    const isCurrentlyActive = user.is_active === true || user.is_active === 1;
    const action = isCurrentlyActive ? 'desativar' : 'reativar';
    
    if (!window.confirm(`Deseja realmente ${action} este usuário?`)) return;
    
    try {
      await userService.update(String(user.id), { 
        is_active: !isCurrentlyActive 
      });
      loadUsers();
    } catch (err) {
      alert('Erro ao processar alteração de status.');
    }
  };

  return {
    users, loading, error, formData, setFormData,
    isEditing, handleEdit, handleDelete, handleSubmit, softDeleteUser, resetForm
  };
}