import { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StoreSelector } from './StoreSelector';
import type { Store } from '../services/storeService';

const GLOBAL_ROLES = ['admin', 'owner', 'proprietario'];

export function StoreSwitcher() {
  const { user, selectedStore, availableStores, setSelectedStore } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const role = user?.role?.toLowerCase();
  const canSwitchStore = !!role && GLOBAL_ROLES.includes(role);

  if (!canSwitchStore || availableStores.length === 0) return null;

  const handleSelect = (store: Store) => {
    setSelectedStore(store);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-sm transition-colors hover:border-rose-300 hover:bg-rose-50"
        aria-label="Trocar loja"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Loja atual
          </span>
          <span className="block max-w-[160px] truncate text-sm font-semibold text-gray-800">
            {selectedStore?.name || 'Selecionar loja'}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <StoreSelector
          stores={availableStores}
          selectedStore={selectedStore}
          onSelect={handleSelect}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
