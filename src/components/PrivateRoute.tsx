import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  allowedRoles?: string[]; // Array opcional de permissões (ex: ['admin', 'proprietario'])
}

export const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { signed, loading, user } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Not Logged In -> Redirect to Login
  // Ajustei o caminho para "/" que geralmente é o Login, ou mude para "/login" se preferir
  if (!signed) {
    return <Navigate to="/" replace />;
  }

  // 3. Role Based Access Control (RBAC)
  // Se a rota exige roles específicas E o usuário não tem a role necessária...
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.warn(`Acesso negado: Usuário ${user.role} tentou acessar rota restrita a ${allowedRoles}`);
    // Redireciona para uma página segura (Home ou Dashboard do usuário)
    return <Navigate to="/home" replace />;
  }

  // 4. Authorized -> Render content
  return <Outlet />;
};