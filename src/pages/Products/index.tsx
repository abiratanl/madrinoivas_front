import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, type Product } from '../../services/productService';

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await productService.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      alert('Produto removido!');
    } catch (error) {
      alert('Erro ao excluir produto.');
    }
  }

  // Helper para pegar a primeira imagem ou placeholder
  const getThumb = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0].url_thumb || product.images[0].url;
    }
    return 'https://placehold.co/50x50?text=S/Foto';
  };

  const formatMoney = (val?: number) => {
    if (val === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (loading) return <div className="p-8 text-center text-rose-600">Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h1>
        <Link 
          to="/products/new" 
          className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition-colors"
        >
          + Novo Produto
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">Foto</th>
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Aluguel</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-2">
                  <img 
                    src={getThumb(product)} 
                    alt="Thumb" 
                    className="h-12 w-12 rounded object-cover border border-gray-200"
                  />
                </td>
                <td className="px-6 py-4 font-mono text-xs">{product.code}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-rose-600 font-bold">
                  {formatMoney(product.rental_price)}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold
                    ${product.status === 'available' ? 'bg-green-100 text-green-800' : 
                      product.status === 'rented' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.status === 'available' ? 'Disponível' : 
                     product.status === 'rented' ? 'Alugado' : product.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="mr-3 font-medium text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Products;