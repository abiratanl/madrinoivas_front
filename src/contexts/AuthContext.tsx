// src/contexts/AuthContext.tsx
// Adicione 'type' antes de ReactNode
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api'; // Usamos a instância global configurada

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  signed: boolean;
  user: User | null;
  loading: boolean;
  // A função signIn apenas "avisa" o contexto que o login ocorreu
  signIn: (user: User, token: string) => void; 
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      // Padronizando as chaves para evitar confusão (sem o prefixo @App)
      const storagedToken = localStorage.getItem('token');
      const storagedUser = localStorage.getItem('user');

      if (storagedToken && storagedUser) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
        setUser(JSON.parse(storagedUser));
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  const signIn = (userData: User, token: string) => {
    // 1. Configura Axios Global
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 2. Persiste
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 3. Atualiza Estado (Isso faz o Sidebar mudar!)
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = undefined;
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