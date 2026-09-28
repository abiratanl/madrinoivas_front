import { Building2, Check } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Store } from '../services/storeService';

interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
  onClose?: () => void;
}

export function StoreSelector({ stores, selectedStore, onSelect, onClose }: StoreSelectorProps) {
  if (stores.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-rose-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">Selecionar Loja</h3>
            {onClose && (
              <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                ✕
              </button>
            )}
          </div>
          <p className="text-rose-100 text-sm">Escolha a loja para acessar o sistema</p>
        </div>

        <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelect(store)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                selectedStore?.id === store.id
                  ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/20"
                  : "border-gray-200 hover:border-rose-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    selectedStore?.id === store.id ? "bg-rose-100 text-rose-600" : "bg-gray-100 text-gray-600"
                  )}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{store.name}</p>
                    {store.address && <p className="text-sm text-gray-500">{store.address}</p>}
                    {store.phone && <p className="text-xs text-gray-400">{store.phone}</p>}
                  </div>
                </div>
                {selectedStore?.id === store.id && (
                  <Check className="w-6 h-6 text-rose-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedStore && onClose && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-all"
            >
              Confirmar e Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}