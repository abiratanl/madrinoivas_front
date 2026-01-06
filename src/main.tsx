import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 1. Toaster: Fica no topo para flutuar sobre tudo */}
    <Toaster 
      position="top-right" 
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#363636',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    />
    
    {/* 2. AuthProvider: Envolve o App para que as rotas tenham acesso ao 'signed' */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);