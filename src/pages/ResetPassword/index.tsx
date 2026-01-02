import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (!token) {
        setMessage({ type: 'error', text: 'Token inválido.' });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await authService.resetPassword(token, password);
      setMessage({ type: 'success', text: 'Senha alterada! Redirecionando...' });      
      
      setTimeout(() => navigate('/auth/login'), 3000);
      
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Token expirado ou inválido.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-madriBg dark:bg-madriDark px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 transition-colors duration-300">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-madriRose">Nova Senha</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Defina sua nova senha de acesso.
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center border
            ${message.type === 'success' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300' 
              : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-300'
            }`}>
            {message.text}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-madriRose focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Senha</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-madriRose focus:outline-none transition-colors"
            />
          </div>
          <button type="submit" disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-200
              ${loading ? 'bg-madriRose/70 cursor-not-allowed' : 'bg-madriRose hover:opacity-90 shadow-md'}`}>
            {loading ? 'Salvando...' : 'Definir Senha'}
          </button>
        </form>
         
         <div className="text-center mt-6">
          <Link to="/auth/login" className="text-sm text-madriGold hover:underline">
            Cancelar
          </Link>
        </div>
      </div>
    </div>
  );
}