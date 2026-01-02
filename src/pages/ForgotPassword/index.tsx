import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await authService.forgotPassword(email);
      setMessage({ type: 'success', text: 'Se o e-mail existir, você receberá um link em instantes.' });
      setEmail(""); 
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erro ao enviar solicitação.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-madriBg dark:bg-madriDark px-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 transition-colors duration-300">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-madriRose">Recuperar Acesso</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Informe seu e-mail para receber as instruções.
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-madriRose focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-200
              ${loading ? 'bg-madriRose/70 cursor-not-allowed' : 'bg-madriRose hover:opacity-90 shadow-md'}`}
          >
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>

        <div className="text-center mt-6">
          {/* CORREÇÃO AQUI: Link aponta para /auth/login */}
          <Link to="/auth/login" className="text-sm text-madriGold hover:underline">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}