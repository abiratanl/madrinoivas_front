import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/lib/axios';
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

  const loadStores = async (userData?: User) => {
    const currentUser = userData || user;
    const role = currentUser?.role?.toLowerCase();
    const scopedRoles = ['local_manager', 'gerente_local', 'attendant', 'atendente'];
    const isScopedUser = !!role && scopedRoles.includes(role) && !!currentUser?.store_id;

    let stores: Store[] = [];
    try {
      if (isScopedUser) {
        const response = await storeService.getById(String(currentUser?.store_id));
        const store = response?.data ?? response;
        stores = store ? [store as Store] : [];
      } else {
        stores = await storeService.getAll();
      }
      setAvailableStores(stores);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      setAvailableStores([]);
    }

    if (isScopedUser) {
      let userStore = stores.find(
        (store) => String(store.id) === String(currentUser?.store_id),
      );

      if (!userStore) {
        userStore = {
          id: String(currentUser?.store_id),
          name: 'Minha Loja',
          address: null,
          address_id: null,
          city: null,
          state: null,
          cnpj: null,
          is_active: true,
          created_at: '',
          updated_at: '',
          contacts: [],
        } as Store;
      }

      setSelectedStoreState(userStore);
      localStorage.setItem('@MadriNoivas:selectedStoreId', String(userStore.id));
      return;
    }

    const savedStoreId = localStorage.getItem('@MadriNoivas:selectedStoreId');
    if (savedStoreId && stores.length > 0) {
      const store = stores.find((item) => String(item.id) === savedStoreId);
      if (store) {
        setSelectedStoreState(store);
        return;
      }
    }

    if (stores.length === 1) {
      setSelectedStoreState(stores[0]);
      localStorage.setItem('@MadriNoivas:selectedStoreId', String(stores[0].id));
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
          await loadStores(parsedUser);
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
      toast.success(`Bem-vindo(a), ${userData.name.split(' ')[0]}!`, {
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      console.log("🔐 Contexto: Login realizado com sucesso para role:", userData.role);
      await loadStores(userData);
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
  const needsStoreSelection = !!(
    user &&
    ['admin', 'owner', 'proprietario'].includes(user.role.toLowerCase()) &&
    !selectedStore &&
    availableStores.length > 0
  );

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