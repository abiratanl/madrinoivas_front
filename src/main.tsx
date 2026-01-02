import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Importe o Provider
import { router } from './routes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Envolve o Router */}
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)