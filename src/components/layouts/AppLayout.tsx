import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { StoreSwitcher } from '../StoreSwitcher';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side: Navigation */}
      <Sidebar />

      {/* Right Side: Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header mobile could go here */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Painel de Controle
          </h2>
          <StoreSwitcher />
        </header>

        {/* Dynamic Page Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px] border border-gray-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
};