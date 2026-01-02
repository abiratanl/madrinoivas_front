import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLogin } from '../../hooks/useLogin';

export default function Login() {
  // Lógica de UI: Inicializa verificando o localStorage ou preferência do sistema
  const [darkMode, setDarkMode] = useState(() => {
    // 1. Verifica se já existe algo salvo
    const savedTheme = localStorage.getItem("madri-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // 2. Se não, verifica a preferência do sistema operacional
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Efeito para salvar a escolha sempre que mudar
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem("madri-theme", "dark");
    } else {
      localStorage.setItem("madri-theme", "light");
    }
  }, [darkMode]);

  // Business Logic (of the existing hook)
  const { 
    email, setEmail, 
    password, setPassword, 
    loading, error, 
    handleSubmit 
  } = useLogin();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center bg-madriBg dark:bg-madriDark px-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 transition-colors duration-300">

          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-semibold text-madriRose">
              Madri Noivas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Benvindo(a) à nossa plataforma!
            </p>
          </div>

          {/* Exibição de Erro */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-center 
                          bg-red-50 text-red-600 border border-red-100
                          dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30">
              {error}
            </div>
          )}

          {/* Formulário */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border 
                           border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-zinc-800 
                           text-gray-900 dark:text-gray-100 
                           focus:ring-2 focus:ring-madriRose focus:outline-none 
                           transition-colors"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border 
                           border-gray-300 dark:border-gray-700 
                           bg-white dark:bg-zinc-800 
                           text-gray-900 dark:text-gray-100 
                           focus:ring-2 focus:ring-madriRose focus:outline-none 
                           transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-200
                ${loading 
                  ? 'bg-madriRose/70 cursor-not-allowed' 
                  : 'bg-madriRose hover:opacity-90 shadow-md hover:shadow-lg'
                }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Links */}
          <div className="flex justify-end mt-6 text-sm">
            <Link to="/auth/forgot-password" className="text-madriGold hover:underline">
              Esqueci minha senha
            </Link>            
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:underline focus:outline-none"
              type="button"
            >
              {darkMode ? "Mudar para Modo Claro ☀️" : "Mudar para Modo Escuro 🌙"}
            </button>
          </div>

          {/* Rodapé */}
          <div className="text-center text-xs text-gray-400 mt-6">
            © 2025 Madri Noivas
          </div>

        </div>
      </div>
    </div>
  );
}