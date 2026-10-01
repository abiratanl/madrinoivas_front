import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { storeService, type Store } from '../services/storeService';

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
  // Store selection
  selectedStore: Store | null;
  availableStores: Store[];
  setSelectedStore: (store: Store) => void;
  loadStores: () => Promise<void>;
  needsStoreSelection: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);
  const [availableStores, setAvailableStores] = useState<Store[]>([]);

  const loadStores = async () => {
    try {
      const stores = await storeService.getAll();
      setAvailableStores(stores);
      // Restore selected store from localStorage
      const savedStoreId = localStorage.getItem('@MadriNoivas:selectedStoreId');
      if (savedStoreId && stores.length > 0) {
        const store = stores.find((s: Store) => String(s.id) === savedStoreId);
        if (store) setSelectedStoreState(store);
      } else if (stores.length === 1) {
        // Auto-select if only one store
        setSelectedStoreState(stores[0]);
        localStorage.setItem('@MadriNoivas:selectedStoreId', String(stores[0].id));
      }
      
      // Auto-select store for attendants based on user.store_id from token
      if (!selectedStore && user?.store_id && stores.length > 0) {
        const userStore = stores.find((s: Store) => String(s.id) === String(user.store_id));
        if (userStore) {
          setSelectedStoreState(userStore);
          localStorage.setItem('@MadriNoivas:selectedStoreId', String(userStore.id));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      // Even if store loading fails, we should still allow the app to work
      setAvailableStores([]);
    }
  };

  useEffect(() => {
    const loadStorageData = async () => {
      const storagedToken = localStorage.getItem('@MadriNoivas:token');
      const storagedUser = localStorage.getItem('@MadriNoivas:user');

      if (storagedToken && storagedUser && storagedToken.length > 10) {
        try {
          const parsedUser = JSON.parse(storagedUser);
          api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
          setUser(parsedUser);
          await loadStores();
        } catch (error) {
          console.error("Erro ao ler dados do storage", error);
          signOut();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);
  
  const signIn = async (token: string, userData: User) => {
    setLoading(true);
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('@MadriNoivas:token', token);
      localStorage.setItem('@MadriNoivas:user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Bem-vinda, ${userData.name.split(' ')[0]}!`, {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      console.log("🔐 Contexto: Login realizado com sucesso para role:", userData.role);
      await loadStores();
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('@MadriNoivas:user');
    localStorage.removeItem('@MadriNoivas:token');
    localStorage.removeItem('@MadriNoivas:selectedStoreId');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setSelectedStoreState(null);
    setAvailableStores([]);
    toast('Até logo! Sessão encerrada.', { icon: '👋' });
    console.log("🔐 Contexto: Logout realizado com sucesso.");
  };

  const setSelectedStore = (store: Store) => {
    setSelectedStoreState(store);
    localStorage.setItem('@MadriNoivas:selectedStoreId', String(store.id));
    toast.success(`Loja selecionada: ${store.name}`, { icon: '🏪' });
  };

  // Admin/Proprietário sem loja selecionada precisa escolher
  // Atendentes usam automaticamente sua loja do token (user.store_id)
  const needsStoreSelection = !!(user && ['admin', 'proprietario'].includes(user.role.toLowerCase()) && !selectedStore && availableStores.length > 0);

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      signIn, 
      signOut, 
      loading,
      selectedStore,
      availableStores,
      setSelectedStore,
      loadStores,
      needsStoreSelection,
    }}>
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