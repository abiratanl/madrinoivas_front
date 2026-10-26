import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const useAuthMock = useAuth as Mock;

const setRole = (role: string) => {
  useAuthMock.mockReturnValue({
    user: {
      id: 1,
      name: 'Usuário Teste',
      email: 'usuario@teste.com',
      role,
    },
    signOut: vi.fn(),
  });
};

describe('Sidebar dashboard permissions', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('shows only the general dashboard for owners', () => {
    setRole('owner');
    render(<Sidebar />);

    expect(screen.getByText('Dashboard Geral')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Local')).not.toBeInTheDocument();
  });

  it('shows both dashboards for admins', () => {
    setRole('admin');
    render(<Sidebar />);

    expect(screen.getByText('Dashboard Geral')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Local')).toBeInTheDocument();
  });

  it('shows only the local dashboard for local managers', () => {
    setRole('local_manager');
    render(<Sidebar />);

    expect(screen.queryByText('Dashboard Geral')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Local')).toBeInTheDocument();
  });
});
