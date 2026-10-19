import { Package, FolderHeart, Image } from 'lucide-react';
import { cn } from '../../utils/cn';

type Tab = 'products' | 'collections' | 'banners';

interface ShowroomTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function ShowroomTabs({ activeTab, onTabChange }: ShowroomTabsProps) {
  const tabs = [
    { id: 'products', label: 'Vitrine / Produtos', icon: Package },
    { id: 'collections', label: 'Coleções', icon: FolderHeart },
    { id: 'banners', label: 'Banners da Home', icon: Image },
  ] as const;

  return (
    <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
      <nav className="container mx-auto px-6" aria-label="Submenu Showroom">
        <ul className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <li key={tab.id} role="presentation">
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap",
                    isActive
                      ? "text-rose-600 border-b-2 border-rose-600 bg-rose-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}