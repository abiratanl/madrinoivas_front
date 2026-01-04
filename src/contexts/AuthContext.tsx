import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

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
  // CORREÇÃO: A ordem agora é (token, user) para bater com o useLogin
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      // Usando chaves específicas para evitar conflito com outros apps em localhost
      const storagedToken = localStorage.getItem('@MadriNoivas:token');
      const storagedUser = localStorage.getItem('@MadriNoivas:user');

      if (storagedToken && storagedUser) {
        try {
          const parsedUser = JSON.parse(storagedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          setUser(parsedUser);
        } catch (error) {
          console.error("Erro ao ler dados do storage", error);
          signOut();
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
    
    // 3. Atualiza Estado
    setUser(userData);
    console.log("🔐 Contexto: Login realizado com sucesso para role:", userData.role);
  };

  const signOut = () => {
    localStorage.removeItem('@MadriNoivas:user');
    localStorage.removeItem('@MadriNoivas:token');
    
    // Importante: limpar o header para evitar erros em requisições futuras
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}