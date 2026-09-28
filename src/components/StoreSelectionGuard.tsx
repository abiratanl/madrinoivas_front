import { useAuth } from '../contexts/AuthContext';
import { StoreSelector } from './StoreSelector';
import { Loader2 } from 'lucide-react';

export function StoreSelectionGuard({ children }: { children: React.ReactNode }) {
  const { needsStoreSelection, availableStores, selectedStore, setSelectedStore, loading, signed } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-rose-600" />
      </div>
    );
  }

  // Only show store selector for logged-in users who need it
  if (signed && needsStoreSelection) {
    return (
      <StoreSelector
        stores={availableStores}
        selectedStore={selectedStore}
        onSelect={setSelectedStore}
      />
    );
  }

  return <>{children}</>;
}