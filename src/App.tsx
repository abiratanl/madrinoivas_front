import { RouterProvider } from 'react-router-dom';
import { router } from './routes'; // Importa o roteador que você postou acima

function App() {
  return (
    // O RouterProvider é quem injeta toda a lógica do seu arquivo de rotas
    <RouterProvider router={router} />
  );
}

export default App;