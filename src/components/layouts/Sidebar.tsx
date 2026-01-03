import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Função para deslogar e voltar para o login
  const handleLogout = () => {
    // 1. Limpa o contexto e storage
    signOut(); 
    // 2. Redireciona manualmente para garantir
    navigate('/auth/login');
  };

  // Verificação de segurança para renderizar o menu correto
  const userRole = user?.role?.toLowerCase() || 'cliente';

  // Definição dos itens de menu baseados no perfil
  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      roles: ['proprietario', 'admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      label: 'Aluguéis', 
      path: '/rentals', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      label: 'Produtos', 
      path: '/products', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      label: 'Categorias', 
      path: '/categories', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      label: 'Usuários', 
      path: '/users', 
      roles: ['admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
     { 
      label: 'Área do Cliente', 
      path: '/client-area', 
      roles: ['cliente'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen shadow-xl">
      {/* 1. Header do Sidebar */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold font-serif text-rose-500 tracking-wider">
          MADRI NOIVAS
        </h1>
      </div>

      {/* 2. Lista de Navegação */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {menuItems
            .filter(item => item.roles.includes(userRole))
            .map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-rose-600 text-white shadow-md' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
          })}
        </ul>
      </nav>

      {/* 3. Rodapé do Usuário (COM LOGOUT) */}
      <div className="border-t border-gray-800 p-4 bg-gray-900/50">
        <div className="flex items-center gap-3">
          
          {/* Avatar com a inicial */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || 'Usuário'}
            </p>
            
            {/* Linha da Role + Botão Logout */}
            <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-gray-400 capitalize truncate">
                    {user?.role || 'Visitante'}
                </p>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:underline transition-colors ml-2"
                    title="Sair do sistema"
                >
                    Sair
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}