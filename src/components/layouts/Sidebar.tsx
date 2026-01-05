import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, X, LayoutDashboard, Calendar, Image, 
  Package, Tag, Users as UsersIcon, UserCircle, LogOut 
} from 'lucide-react';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Controle do menu mobile
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(); 
    navigate('/auth/login');
  };

  const userRole = user?.role?.toLowerCase() || 'cliente';

  // Definição dos itens de menu baseados no perfil
  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      roles: ['proprietario', 'admin'],
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    { 
      label: 'Aluguéis', 
      path: '/rentals', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: <Calendar className="w-5 h-5" />
    },
    { 
      label: 'Showroom', 
      path: '/showroom', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: <Image className="w-5 h-5" />
    },
    { 
      label: 'Produtos', 
      path: '/products', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: <Package className="w-5 h-5" />
    },
    { 
      label: 'Categorias', 
      path: '/categories', 
      roles: ['proprietario', 'atendente', 'admin'],
      icon: <Tag className="w-5 h-5" />
    },
    { 
      label: 'Usuários', 
      path: '/users', 
      roles: ['admin', 'proprietario'],
      icon: <UsersIcon className="w-5 h-5" />
    },
    { 
      label: 'Área do Cliente', 
      path: '/client-area', 
      roles: ['cliente'],
      icon: <UserCircle className="w-5 h-5" />
    },
  ];

  return (
    <>
      {/* BOTÃO MOBILE (Aparece apenas em telas pequenas) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 bg-rose-600 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* OVERLAY ESCURO (Fecha o menu ao clicar fora) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white flex flex-col h-screen shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header do Sidebar */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <h1 className="text-xl font-bold font-serif text-rose-500 tracking-wider">
            MADRI NOIVAS
          </h1>
        </div>

        {/* Lista de Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <ul className="space-y-1.5 px-4">
            {menuItems
              .filter(item => item.roles.includes(userRole))
              .map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' 
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </li>
                );
            })}
          </ul>
        </nav>

        {/* Rodapé do Usuário */}
        <div className="border-t border-gray-800 p-4 bg-gray-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role || 'Visitante'}
                </p>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Sair
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}