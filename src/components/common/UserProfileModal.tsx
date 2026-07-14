// src/components/common/UserProfileModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'react-toastify';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper component to render input fields consistently
const FormField = ({ label, id, type, value, onChange, placeholder, showPassword, togglePassword }: any) => (
  <div className="relative">
    <label htmlFor={id} className="block text-xs font-bold text-gray-500 mb-1.5 tracking-wide">
      {label}
    </label>
    <input
      type={showPassword ? 'text' : type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all text-sm pr-10"
    />
    {togglePassword && (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-9 text-gray-400 hover:text-rose-600 transition-colors"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    )}
  </div>
);

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Proteção extra: se já estiver carregando, não faça nada
    if (loading) return;

    setLoading(true);

    try {
      await authService.changePassword(passwords.current, passwords.new);
      toast.success("Senha alterada com sucesso!");
      handleClose();
    } catch (error: any) {
      console.error("Erro capturado:", error);


      const message = error.response?.data?.message === 'Current password is incorrect.'
        ? 'A senha atual está incorreta.'
        : 'Ocorreu um erro ao atualizar a senha.';

      toast.error(message);

      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setPasswords(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">

      {/* Container do Modal - Tamanho fixo similar ao de cadastro */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideInUp">

        {/* Cabeçalho Rosa idêntico ao 'image_a708ff.png' */}
        <div className="bg-rose-600 p-5 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold tracking-tight">Alterar Senha</h2>
          <button
            onClick={handleClose}
            className="text-rose-200 hover:text-white transition-colors p-1 rounded-full hover:bg-rose-700"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormField
            label="SENHA ATUAL"
            id="current" // Use IDs únicos
            type="password"
            value={passwords.current} // Valor específico deste campo
            onChange={(e: any) => setPasswords({ ...passwords, current: e.target.value })}
            showPassword={showCurrent}
            togglePassword={() => setShowCurrent(!showCurrent)}
          />

          <FormField
            label="NOVA SENHA"
            id="new"
            type="password"
            value={passwords.new} // Valor específico deste campo
            onChange={(e: any) => setPasswords({ ...passwords, new: e.target.value })}
            showPassword={showNew}
            togglePassword={() => setShowNew(!showNew)}
          />

          <FormField
            label="CONFIRMAR NOVA SENHA"
            id="confirm"
            type="password"
            value={passwords.confirm} // Valor específico deste campo
            onChange={(e: any) => setPasswords({ ...passwords, confirm: e.target.value })}
            showPassword={showConfirm}
            togglePassword={() => setShowConfirm(!showConfirm)}
          />

          {/* Rodapé com botões idênticos ao 'image_a708ff.png' */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-semibold text-sm transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                }`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}