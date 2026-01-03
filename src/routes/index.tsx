import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout Imports
import { AppLayout } from '../components/layouts/AppLayout';
import { AuthLayout } from '../components/layouts/AuthLayout';

// Security Guard Import
import { PrivateRoute } from '../components/PrivateRoute';

// --- Lazy Loading Pages ---
// Adicionamos '/index' explicitamente para evitar erros de importação com o lazy

// Public & Auth
const Home = lazy(() => import('../pages/Home/index'));
const Login = lazy(() => import('../pages/Login/index'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword/index'));
const ResetPassword = lazy(() => import('../pages/ResetPassword/index'));
const ChangePassword = lazy(() => import('../pages/ChangePassword/index'));
const NotFound = lazy(() => import('../pages/NotFound/index'));

// Admin / System Pages
const Dashboard = lazy(() => import('../pages/Dashboard/index'));
const Users = lazy(() => import('../pages/Users/index')); 
const ClientPage = lazy(() => import('../pages/Clients/index')); 
const Rentals = lazy(() => import('../pages/Rentals/index'));

// === CATEGORIAS ===
const Categories = lazy(() => import('../pages/Categories/index'));
const CategoryForm = lazy(() => import('../pages/CategoryForm/index'));

// === PRODUTOS (Agora habilitados) ===
const Products = lazy(() => import('../pages/Products/index'));
const ProductForm = lazy(() => import('../pages/ProductForm/index'));

// Simple Loading Component
const Loading = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="animate-pulse text-rose-600 font-semibold">Carregando...</div>
  </div>
);

export const router = createBrowserRouter([
  // 1. PUBLIC ROUTE (LANDING PAGE)
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    )
  },
  // Rota alias para /home funcionar igual a /
  {
    path: "/home",
    element: (
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    )
  },

  // 2. AUTHENTICATION ROUTES
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<Loading />}>
            <Login />
          </Suspense>
        )
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={<Loading />}>
            <ForgotPassword />
          </Suspense>
        )
      },
      {
        path: "reset-password/:token",
        element: (
          <Suspense fallback={<Loading />}>
            <ResetPassword />
          </Suspense>
        )
      },
      {
        path: "change-password",
        element: (
          <Suspense fallback={<Loading />}>
            <ChangePassword />
          </Suspense>
        )
      }
    ]
  },

  // 3. PRIVATE SYSTEM ROUTES
  {
    element: <PrivateRoute />, 
    children: [
      {
        element: <AppLayout />, 
        children: [
          
          // --- MANAGEMENT AREA (Admin and Owner) ---
          {
            element: <PrivateRoute allowedRoles={['admin', 'proprietario']} />,
            children: [
              {
                path: "/dashboard", 
                element: (
                  <Suspense fallback={<Loading />}>
                    <Dashboard />
                  </Suspense>
                )
              }
            ]
          },

          // --- ADMINISTRATIVE AREA (Admin Only) ---
          {
            element: <PrivateRoute allowedRoles={['admin']} />,
            children: [
              {
                path: "/users", 
                element: (
                  <Suspense fallback={<Loading />}>
                    <Users />
                  </Suspense>
                )
              }
            ]
          },

          // --- OPERATIONAL AREA (Admin, Owner, Attendant) ---
          {
            element: <PrivateRoute allowedRoles={['admin', 'proprietario', 'atendente']} />,
            children: [
              {
                path: "/rentals", 
                element: (
                  <Suspense fallback={<Loading />}>
                    <Rentals />
                  </Suspense>
                )
              },
              // === ROTAS DE CATEGORIAS ===
              {
                path: "/categories",
                element: (
                  <Suspense fallback={<Loading />}>
                    <Categories />
                  </Suspense>
                )
              },
              {
                path: "/categories/new",
                element: (
                  <Suspense fallback={<Loading />}>
                    <CategoryForm />
                  </Suspense>
                )
              },
              {
                path: "/categories/edit/:id",
                element: (
                  <Suspense fallback={<Loading />}>
                    <CategoryForm />
                  </Suspense>
                )
              },
              // === ROTAS DE PRODUTOS ===
              {
                path: "/products",
                element: (<Suspense fallback={<Loading />}><Products /></Suspense>)
              },
              {
                path: "/products/new",
                element: (<Suspense fallback={<Loading />}><ProductForm /></Suspense>)
              },
              {
                path: "/products/edit/:id",
                element: (<Suspense fallback={<Loading />}><ProductForm /></Suspense>)
              }
            ]
          },

          // --- CUSTOMER AREA ---
          {
            element: <PrivateRoute allowedRoles={['cliente']} />,
            children: [
              {
                path: "/client-area", 
                element: (
                  <Suspense fallback={<Loading />}>
                    <ClientPage />
                  </Suspense>
                )
              }
            ]
          }                 
        ]
      }
    ]
  },

  // 4. 404 CATCH-ALL
  {
    path: "*",
    element: (
      <Suspense fallback={<Loading />}>
        <NotFound />
      </Suspense>
    )
  }
]);