import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, type Product } from '../../services/productService';
import { ShoppingBag, Tag, Star } from 'lucide-react';

export function Collection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const productList = await productService.getAllPublic({ status: 'available' });
      setProducts(productList.slice(0, 8));
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
      <section id="colecao" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-madriGold tracking-widest uppercase mb-4">Nossa Coleção</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900 mb-6">
              Vestidos & <span className="text-madriGold">Trajes</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md border border-gray-100 animate-pulse">
                <div className="aspect-[3/4] w-full bg-gray-200" />
                <div className="p-5 flex flex-col flex-grow space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="colecao" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-sm font-semibold text-madriGold tracking-widest uppercase mb-4">Nossa Coleção</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900">
              Vestidos & <span className="text-madriGold">Trajes</span>
            </h2>
          </div>
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-full hover:border-madriGold hover:bg-madriGold/5 hover:text-madriGold transition-all"
          >
            Ver Toda a Coleção
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
          </Link>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <article
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.is_featured && (
                    <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide flex items-center gap-1">
                      <Star className="w-3 h-3" aria-hidden="true" />
                      Destaque
                    </span>
                  )}
                  {product.status === 'rented' && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                      Alugado
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to="/auth/login"
                    className="p-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg hover:bg-white hover:shadow-xl transition-all"
                    aria-label={`Ver detalhes de ${product.name}`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3" aria-hidden="true" />
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

                  <Link
                    to="/auth/login"
                    className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors"
                    aria-label={`Ver detalhes de ${product.name}`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-madriGold rounded-full hover:bg-madriGold/90 hover:shadow-xl transition-all"
            >
              Ver Todos os Produtos
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}