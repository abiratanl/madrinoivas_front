import { useState, useEffect } from 'react';
import { storeService, type Store, type CreateStoreDTO, type UpdateStoreDTO, type StoreAddress } from '../services/storeService';

interface StoreFormData {
  id: string; 
  name: string;
  phone: string;
  is_active: boolean;
  addresses: StoreAddress[];
}

const emptyAddress: StoreAddress = {
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  type: 'commercial',
  label: 'Principal',
  is_default: true,
};

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<StoreFormData>({
    id: '', 
    name: '',
    phone: '',
    is_active: true,
    addresses: [emptyAddress],
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async (showInactive = false) => {
    try {
      setLoading(true);
      const response = await storeService.getAll(showInactive);
      const storeList = Array.isArray(response) ? response : (response.data || []);
      setStores(storeList);
    } catch (err) {
      setError('Não foi possível carregar a lista de lojas.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store: Store) => {
    setFormData({
      id: String(store.id), 
      name: store.name,
      phone: store.phone || '',
      is_active: store.is_active === true || store.is_active === 1,
      addresses: store.addresses && store.addresses.length > 0 
        ? store.addresses 
        : [emptyAddress],
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', phone: '', is_active: true, addresses: [emptyAddress] });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    
    try {
      // Filter out empty address fields
      const validAddresses = formData.addresses.filter(addr => 
        addr.zip_code || addr.street || addr.number || addr.city || addr.state
      );

      if (isEditing && formData.id) {
        await storeService.update(formData.id, {
          name: formData.name,
          phone: formData.phone || null,
          addresses: validAddresses,
        });
        alert('Loja atualizada com sucesso!');
      } else {
        await storeService.create({
          name: formData.name,
          phone: formData.phone || null,
          addresses: validAddresses,
        });
        alert('Loja criada com sucesso!');
      }
      
      resetForm();
      loadStores();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erro ao salvar loja.';
      alert(msg);
      return false;
    }
  };

  const handleToggleActive = async (storeId: string) => {
    try {
      await storeService.toggleActive(storeId);
      loadStores();
    } catch (err) {
      alert('Erro ao alterar status da loja.');
    }
  };

  return {
    stores, loading, error, formData, setFormData,
    isEditing, handleEdit, handleToggleActive, handleSubmit, resetForm
  };
}

export type { Store, CreateStoreDTO, UpdateStoreDTO, StoreAddress };