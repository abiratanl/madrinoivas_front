import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  store_id?: string;
  avatar?: string;
}

interface AuthContextType {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedToken = localStorage.getItem('@MadriNoivas:token');
      const storagedUser = localStorage.getItem('@MadriNoivas:user');

      // Verifica se ambos existem e se o token não é apenas uma string em branco
      if (storagedToken && storagedUser && storagedToken.length > 10) {
        try {
          const parsedUser = JSON.parse(storagedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          setUser(parsedUser);
        } catch (error) {
          console.error("Erro ao ler dados do storage", error);
          signOut(); // Limpa tudo se os dados estiverem corrompidos
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);
  
  const signIn = (token: string, userData: User) => {
    // 1. Configura Axios Global
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 2. Persiste com nomes de chave seguros
    localStorage.setItem('@MadriNoivas:token', token);
    localStorage.setItem('@MadriNoivas:user', JSON.stringify(userData));
    
    // 3. Atualiza Estado e Notifica
    setUser(userData);
    toast.success(`Bem-vinda, ${userData.name.split(' ')[0]}!`, {
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
    console.log("🔐 Contexto: Login realizado com sucesso para role:", userData.role);
  };

  const signOut = () => {
    localStorage.removeItem('@MadriNoivas:user');
    localStorage.removeItem('@MadriNoivas:token');
    
    // Limpa o header para evitar que o token antigo seja usado
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    toast('Até logo! Sessão encerrada.', { icon: '👋' });
    console.log("🔐 Contexto: Logout realizado com sucesso.");
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}