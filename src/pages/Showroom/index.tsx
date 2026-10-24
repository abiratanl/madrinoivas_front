import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StoreSelector } from '../../components/StoreSelector';
import { ShowroomTabs } from '../../components/showroom/ShowroomTabs';
import { ShowroomProducts } from '../../components/showroom/ShowroomProducts';
import { ShowroomCollections } from '../../components/showroom/ShowroomCollections';
import { ShowroomBanners } from '../../components/showroom/ShowroomBanners';
import type { Store } from '../../services/storeService';

type Tab = 'products' | 'collections' | 'banners';

export default function Showroom() {
  const { selectedStore, availableStores, setSelectedStore, loading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('products');

  // Debug
  console.log('Showroom render:', { selectedStore, availableStores: availableStores?.length, authLoading, userRole: user?.role });

  // Keep track of scroll position per tab
  const [scrollPositions, setScrollPositions] = useState<Record<Tab, number>>({
    products: 0,
    collections: 0,
    banners: 0,
  });

  const handleTabChange = (tab: Tab) => {
    setScrollPositions(prev => ({
      ...prev,
      [activeTab]: window.scrollY,
    }));
    
    setActiveTab(tab);
    
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositions[tab] || 0);
    });
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  // Show store selector if no store selected and user is admin/owner
  const needsStoreSelection = selectedStore === null && availableStores.length > 0 && !authLoading && user && ['admin', 'owner', 'proprietario'].includes(user.role?.toLowerCase());

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (needsStoreSelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <StoreSelector 
          stores={availableStores} 
          selectedStore={null}
          onSelect={handleStoreSelect}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ShowroomTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="animate-in fade-in duration-200">
        {activeTab === 'products' && (
          <ShowroomProducts selectedStoreId={selectedStore?.id} />
        )}
        {activeTab === 'collections' && (
          <ShowroomCollections selectedStoreId={selectedStore?.id} />
        )}
        {activeTab === 'banners' && (
          <ShowroomBanners selectedStoreId={selectedStore?.id} />
        )}
      </div>
    </div>
  );
}