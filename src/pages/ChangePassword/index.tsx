import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const tempToken = location.state?.tempToken;
  const userEmail = location.state?.email;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tempToken) {
      // Se não tiver token, volta pro login
      navigate('/auth/login');
    }
  }, [tempToken, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não conferem.');
      return;
    }

    try {
      setLoading(true);

      const payload = { 
        email: userEmail,
        // ALTERADO AQUI: De 'oldPassword' para 'currentPassword'
        // para bater com a mensagem de erro do backend.
        currentPassword: currentPassword, 
        newPassword: newPassword 
      };

      console.log("📤 Enviando Payload:", payload); // Olhe no Console (F12) se os dados aparecem aqui

      const response = await api.post('/auth/change-password', payload, {
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        }
      );

      console.log("✅ Sucesso:", response.data);
      alert('Senha alterada com sucesso!');

      // Login automático
      const responseData = response.data.data || response.data;
      if (response.data.token && responseData.user) {
        const userToSave = {
        ...responseData.user,
        role: responseData.user.role || 'cliente' // Fallback de segurança
    };
         signIn(response.data.token, userToSave);
         
         const role = responseData.user.role?.toLowerCase();
         if (role === 'admin') navigate('/users');
         else if (role === 'proprietario') navigate('/dashboard');
         else if (role === 'atendente') navigate('/rentals');
         else navigate('/client-area');
      } else {
        navigate('/auth/login');
      }

    } catch (err: any) {
      console.error("❌ Erro:", err.response?.data);
      setError(err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Definir Nova Senha
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          Conta: <strong>{userEmail || 'Email não detectado'}</strong><br/>
          Confirme a senha atual e crie a definitiva.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="Senha temporária"
            />
          </div>

          <hr className="my-4" />

          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="Nova senha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="Confirme a nova senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white py-2 rounded font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Enviando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ChangePassword;