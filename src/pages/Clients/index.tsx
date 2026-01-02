// src/pages/Client/index.tsx
import { CalendarDays, ShoppingBag } from 'lucide-react';

export default function Clients() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
        
        {/* Icons Header */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <ShoppingBag size={32} />
          </div>
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <CalendarDays size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Olá, Cliente!
        </h1>
        
        <p className="text-gray-500 mb-8">
          Aqui serão exibidos os seus <strong>alugueis</strong> e <strong>agendamentos</strong>.
        </p>

        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
          🚧 Funcionalidade em desenvolvimento
        </div>

      </div>
    </div>
  );
}