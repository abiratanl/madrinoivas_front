import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StoreSelectionGuard } from './components/StoreSelectionGuard';

function App() {
  return (
    <ErrorBoundary>
      <StoreSelectionGuard>
        <RouterProvider router={router} />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </StoreSelectionGuard>
    </ErrorBoundary>
  );
}

export default App;