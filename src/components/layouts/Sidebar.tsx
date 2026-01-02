// src/components/layouts/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  LogOut, 
  CalendarDays 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'proprietario']
  },
  {
    label: 'Usuários',
    path: '/users',
    icon: Users,
    allowedRoles: ['admin']
  },
  {
    label: 'Aluguéis',
    path: '/rentals',
    icon: ShoppingBag,
    allowedRoles: ['admin', 'proprietario', 'atendente']
  },
  {
    label: 'Minha Área',
    path: '/client-area',
    icon: CalendarDays,
    allowedRoles: ['cliente']
  }
];

export function Sidebar() {
  const { user, signOut } = useAuth();

  // --- DEBUG FORCE (Veja isso no Console F12) ---
  console.log("🔍 SIDEBAR DEBUG:", { 
    usuarioLogado: user?.name, 
    roleNoContexto: user?.role,
    roleEsperada: 'atendente' 
  });

  if (!user) return null; 

  // Normalização: Converte tudo para minúsculo para garantir a comparação
  const userRole = user.role.toLowerCase();

  const filteredItems = MENU_ITEMS.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">
          Tech-S
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          <span className="text-white font-medium capitalize">{user.role}</span>
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}