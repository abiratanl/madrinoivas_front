import { useState, useCallback } from 'react';
import {
  storeService,
  type Store,
  type CreateStoreDTO,
  type UpdateStoreDTO,
  type StoreAddress,
  type StoreContact,
  type StorePayload,
} from '../services/storeService';

interface StoreFormData {
  id: string; 
  name: string;
  cnpj: string;
  owner_name: string;
  owner_cpf: string;
  owner_signature: string | null;
  ownerSignatureFile: File | null;
  removeOwnerSignature: boolean;
  is_active: boolean;
  addresses: StoreAddress[];
  contacts: StoreContact[];
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

const emptyContact: StoreContact = {
  type: 'whatsapp',
  value: '',
  is_primary: true,
};

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<StoreFormData>({
    id: '', 
    name: '',
    cnpj: '',
    owner_name: '',
    owner_cpf: '',
    owner_signature: null,
    ownerSignatureFile: null,
    removeOwnerSignature: false,
    is_active: true,
    addresses: [emptyAddress],
    contacts: [emptyContact],
  });

  const loadStores = useCallback(async (showInactive = false) => {
    try {
      setLoading(true);
      const response = await storeService.getAll(showInactive);
      const storeList = Array.isArray(response) ? response : (response.data || []);
      setStores(storeList);
    } catch {
      setError('Não foi possível carregar a lista de lojas.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = (store: Store) => {
    setFormData({
      id: String(store.id), 
      name: store.name,
      cnpj: store.cnpj || '',
      owner_name: store.owner_name || '',
      owner_cpf: store.owner_cpf || '',
      owner_signature: store.owner_signature_url || store.owner_signature || null,
      ownerSignatureFile: null,
      removeOwnerSignature: false,
      is_active: store.is_active === true || store.is_active === 1,
      addresses: store.addresses && store.addresses.length > 0 
        ? store.addresses 
        : [emptyAddress],
      contacts: store.contacts && store.contacts.length > 0
        ? store.contacts
        : [emptyContact],
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      cnpj: '',
      owner_name: '',
      owner_cpf: '',
      owner_signature: null,
      ownerSignatureFile: null,
      removeOwnerSignature: false,
      is_active: true,
      addresses: [emptyAddress],
      contacts: [emptyContact],
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    
    if (submitting) return false;
    setSubmitting(true);
    
    try {
      // Filter out empty address fields
      const validAddresses = formData.addresses.filter(addr => 
        addr.zip_code || addr.street || addr.number || addr.city || addr.state
      );

      // Filter out contacts without value and guarantee a single primary
      const validContacts = formData.contacts
        .filter(contact => contact.value?.trim())
        .map(contact => ({ ...contact, value: contact.value.trim() }));
      if (validContacts.length > 0 && !validContacts.some(contact => contact.is_primary)) {
        validContacts[0].is_primary = true;
      }

      const storeData: CreateStoreDTO = {
        name: formData.name,
        cnpj: formData.cnpj.trim() || null,
        owner_name: formData.owner_name.trim() || null,
        owner_cpf: formData.owner_cpf.trim() || null,
        addresses: validAddresses,
        contacts: validContacts,
      };

      let payload: StorePayload = storeData;

      if (formData.ownerSignatureFile || formData.removeOwnerSignature) {
        payload = new FormData();
        payload.append('name', storeData.name);
        payload.append('cnpj', storeData.cnpj || '');
        payload.append('owner_name', storeData.owner_name || '');
        payload.append('owner_cpf', storeData.owner_cpf || '');
        payload.append('addresses', JSON.stringify(validAddresses));
        payload.append('contacts', JSON.stringify(validContacts));

        if (formData.ownerSignatureFile) {
          payload.append(
            'owner_signature',
            formData.ownerSignatureFile,
            formData.ownerSignatureFile.name,
          );
        } else {
          payload.append('owner_signature', '');
        }
      }

      if (isEditing && formData.id) {
        await storeService.update(formData.id, payload);
        alert('Loja atualizada com sucesso!');
      } else {
        await storeService.create(payload);
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (storeId: string) => {
    try {
      await storeService.toggleActive(storeId);
      loadStores();
    } catch {
      alert('Erro ao alterar status da loja.');
    }
  };

  return {
    stores, loading, error, formData, setFormData,
    isEditing, handleEdit, handleToggleActive, handleSubmit, resetForm, loadStores, submitting
  };
}

export type { Store, CreateStoreDTO, UpdateStoreDTO, StoreAddress, StoreContact };