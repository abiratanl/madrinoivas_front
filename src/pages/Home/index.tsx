import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// === A CORREÇÃO CRÍTICA ESTÁ AQUI ===
// Usamos 'type Product' para o navegador saber que é apenas tipagem
import { productService, type Product } from '../../services/productService';

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      // Busca produtos filtrando apenas os disponíveis
      // O 'any' é para garantir compatibilidade se vier paginado
      const response: any = await productService.getAll({ status: 'available' });
      
      // BLINDAGEM: Verifica se o backend devolveu um array direto ou um objeto paginado
      const productList = Array.isArray(response) ? response : (response.data || []);
      
      setProducts(productList);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar a coleção no momento.');
    } finally {
      setLoading(false);
    }
  }

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getImageUrl = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url_thumb || product.images[0].url;
    }
    return 'https://placehold.co/400x600/f3f4f6/a3a3a3?text=Sem+Foto'; 
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* === HERO / CABEÇALHO === */}
      <header className="bg-amber-400 py-20 text-white shadow-lg relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="mb-4 text-5xl font-bold tracking-tight font-serif">Madri Noivas</h1>
          <p className="text-xl opacity-90 font-light mb-8">Você vive o momento, nós vestimos a memória.</p>
          
          <div>
            <Link 
              to="/auth/login" 
              className="inline-block rounded-full bg-white px-8 py-3 text-sm font-bold text-rose-600 shadow-lg transition-transform hover:scale-105 hover:bg-gray-100 uppercase tracking-wider"
            >
              Acessar Área Restrita
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
      </header>

      {/* === CONTEÚDO PRINCIPAL === */}
      <main className="container mx-auto mt-12 px-4">
        
        <div className="flex items-center justify-center mb-12">
          <div className="h-px w-16 bg-rose-200"></div>
          <h2 className="mx-4 text-3xl font-semibold text-gray-800 font-serif">
            Nossa Coleção
          </h2>
          <div className="h-px w-16 bg-rose-200"></div>
        </div>

        {error && (
          <div className="mx-auto max-w-lg rounded-lg bg-red-50 p-4 text-center text-red-600 border border-red-100 mb-8">
            {error}
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum vestido disponível no momento.</p>
          </div>
        )}

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100"
            >
              {/* Imagem */}
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_featured && (
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                        Destaque
                    </span>
                    )}
                    {product.status === 'rented' && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                        Alugado
                    </span>
                    )}
                </div>
              </div>

              {/* Informações */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase">
                    Ref: {product.code}
                  </span>
                  {product.size && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                      Tam: {product.size}
                    </span>
                  )}
                </div>

                <h3 className="mb-1 text-lg font-bold text-gray-800 line-clamp-1" title={product.name}>
                  {product.name}
                </h3>
                
                <div className="flex-grow"></div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Valor do Aluguel</span>
                    <span className="text-xl font-bold text-rose-600">
                      {formatMoney(product.rental_price)}
                    </span>
                  </div>
                  
                  <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
            <h4 className="text-2xl font-serif font-bold mb-4 text-rose-500">Madri Noivas</h4>
            <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto">
                Realizando sonhos através de vestidos inesquecíveis.
            </p>
            <p className="text-gray-600 text-xs border-t border-gray-800 pt-8">
                &copy; {new Date().getFullYear()} Madri Noivas. Todos os direitos reservados.
            </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;