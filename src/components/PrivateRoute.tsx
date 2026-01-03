import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { signed, loading, user } = useAuth();

  // 1. Aguarda o carregamento do LocalStorage antes de decidir
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-rose-600"></div>
      </div>
    );
  }

  // 2. Se não estiver logado -> Redireciona para Login (ou Raiz)
  if (!signed || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Validação de Permissões (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    // Normaliza para lowercase para evitar erros (Admin vs admin)
    const userRole = user.role?.toLowerCase();
    
    // Verifica se a role do usuário está na lista de permitidos
    // Nota: allowedRoles também deve estar em lowercase no arquivo de rotas
    if (!allowedRoles.includes(userRole)) {
      console.warn(`⛔ Acesso negado. Usuário: ${userRole}, Rota exige: ${allowedRoles}`);
      
      // Redireciona para a raiz (Dashboard ou Home pública)
      return <Navigate to="/" replace />;
    }
  }

  // 4. Autorizado -> Renderiza a página
  return <Outlet />;
};