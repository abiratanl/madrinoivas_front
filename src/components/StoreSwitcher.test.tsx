import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@/utils/test-utils';
import { useAuth } from '@/contexts/AuthContext';
import { StoreSwitcher } from './StoreSwitcher';
import type { Store } from '../services/storeService';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = useAuth as Mock;

const storeA = {
  id: 'store-a',
  name: 'Loja A',
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

const storeB = {
  ...storeA,
  id: 'store-b',
  name: 'Loja B',
} as Store;

const setSelectedStore = vi.fn();

const setAuth = (role: string) => {
  useAuthMock.mockReturnValue({
    user: { role },
    selectedStore: storeA,
    availableStores: [storeA, storeB],
    setSelectedStore,
  });
};

describe('StoreSwitcher', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    setSelectedStore.mockReset();
  });

  it('does not render for store-scoped profiles', () => {
    setAuth('local_manager');
    render(<StoreSwitcher />);

    expect(screen.queryByLabelText('Trocar loja')).not.toBeInTheDocument();
  });

  it('changes the selected store for admins without logging out', () => {
    setAuth('admin');
    render(<StoreSwitcher />);

    fireEvent.click(screen.getByLabelText('Trocar loja'));
    fireEvent.click(screen.getByText('Loja B'));

    expect(setSelectedStore).toHaveBeenCalledWith(storeB);
  });
});
