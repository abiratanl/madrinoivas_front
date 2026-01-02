// src/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

// --- Type Definitions ---

// Represents the User object coming from the Database (MySQL)
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'atendente' | 'proprietario' | 'cliente';
  is_active: boolean | number; // MySQL often returns 1 for true, 0 for false
}

// Represents the Form State (ID is empty string when creating new)
interface UserFormData {
  id: number | ''; 
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export function useUsers() {
  // --- Data State (List of Users) ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Form State (Editing/Creating) ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    name: '',
    email: '',
    role: 'atendente', // Default role for new users
    is_active: true
  });

  // --- Lifecycle ---
  // Load users immediately when the hook is used
  useEffect(() => {
    loadUsers();
  }, []);

  // --- Actions & Handlers ---

  /**
   * Fetches the list of users from the API via userService.
   * Handles loading state and error messages.
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const response = await userService.getAll();
      
      // Robust check: API might return an array directly OR an object { data: [...] }
      // This prevents the app from crashing if the backend structure changes slightly
      const userList = Array.isArray(response) ? response : (response.data || []);
      
      setUsers(userList);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError('Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Populates the form with the selected user's data for editing.
   */
  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Converts MySQL 1/0 to Javascript true/false
      is_active: Boolean(user.is_active) 
    });
    setIsEditing(true);
  };

  /**
   * Resets the form to its initial empty state (for creating new users).
   */
  const resetForm = () => {
    setFormData({ 
      id: '', 
      name: '', 
      email: '', 
      role: 'atendente', 
      is_active: true 
    });
    setIsEditing(false);
  };

  /**
   * Handles Form Submission (Create or Update).
   * Determines logic based on the 'isEditing' flag.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    
    try {
      if (isEditing && typeof formData.id === 'number') {
        // --- UPDATE FLOW ---
        await userService.update(formData.id, {
          name: formData.name,
          role: formData.role,
          is_active: formData.is_active
        });
        alert('Usuário atualizado com sucesso!');
      } else {
        // --- CREATE FLOW ---
        await userService.create({
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        alert('Usuário criado! Uma senha temporária foi enviada (log).');
      }
      
      // On success: clear form and reload list
      resetForm();
      loadUsers();

    } catch (err: any) {
      console.error("Error saving user:", err);
      // Extracts error message from Backend or uses generic fallback
      const msg = err.response?.data?.message || 'Erro ao salvar usuário.';
      alert(msg);
    }
  };

  /**
   * Deletes (or Soft Deletes) a user.
   */
  const handleDelete = async (id: number) => {
    // Native confirmation dialog
    if (!window.confirm('Tem certeza que deseja desativar este usuário?')) return;
    
    try {
      await userService.delete(id);
      loadUsers(); // Refresh list
    } catch (err) {
      console.error("Error deleting user:", err);
      alert('Erro ao desativar usuário.');
    }
  };

  // --- Expose Public API ---
  // Only these properties/functions are accessible to the Component
  return {
    users,
    loading,
    error,
    formData,
    setFormData,
    isEditing,
    handleEdit,
    handleDelete,
    handleSubmit,
    resetForm
  };
}