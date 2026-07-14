import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastContainer } from 'react-toastify'; // Importe a biblioteca
import 'react-toastify/dist/ReactToastify.css'; // Importe o CSS da biblioteca

function App() {
  return (
    <>
      {/* 
         O RouterProvider cuida das páginas. 
         O ToastContainer cuida das notificações que aparecerão sobre qualquer página.
      */}
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
    </>
  );
}

export default App;