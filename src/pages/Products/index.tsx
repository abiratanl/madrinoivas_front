import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productService, type Product } from "../../services/productService";
import { categoryService, type Category } from "../../services/categoryService";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isGlobal, setIsGlobal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Carregar categorias ao abrir a tela
  useEffect(() => {
    loadCategories();
  }, []);

  // Recarregar produtos se mudar o filtro ou o checkbox global
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, isGlobal]);

  async function loadCategories() {
    try {
      const result = await categoryService.getAll();
      if (Array.isArray(result)) {
        setCategories(result);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias", error);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      // Busca os produtos (já retorna array limpo do service)
      const result = await productService.getAll({
        categoryId: selectedCategory,
        globalSearch: isGlobal,
      });

      console.log("Produtos carregados:", result); // Debug no console

      if (Array.isArray(result)) {
        setProducts(result);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await productService.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      alert("Produto removido!");
    } catch (error) {
      alert("Erro ao excluir produto.");
    }
  }

  // Helper para exibir imagem (Capa do Join ou Array de Imagens)
  const getThumb = (product: Product) => {
    // 1. Tenta pegar a URL direta (vinda do SQL otimizado)
    if (product.image_url) return product.image_url;

    // 2. Tenta pegar do array de imagens (caso venha completo)
    if (product.images && product.images.length > 0) {
      return product.images[0].url_thumb || product.images[0].url;
    }

    // 3. Fallback se não tiver foto
    return "https://placehold.co/50x50?text=S/Foto";
  };

  const formatMoney = (val?: number) => {
    if (val === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="container mx-auto p-6">
      {/* --- CABEÇALHO E FILTROS --- */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h1>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Checkbox Busca Global */}
          <label className="flex items-center gap-2 cursor-pointer bg-white hover:bg-gray-50 px-3 py-2 rounded border border-gray-300 shadow-sm transition-colors">
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Ver Todas as Lojas
            </span>
          </label>

          {/* Dropdown Categorias */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
          >
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Botão Novo */}
          <Link
            to="/products/new"
            className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition-colors whitespace-nowrap shadow-sm font-medium"
          >
            + Novo Produto
          </Link>
        </div>
      </div>

      {/* --- TABELA DE DADOS --- */}
      {loading ? (
        <div className="p-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
          <p className="mt-2 text-rose-600 font-medium">
            Carregando produtos...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Foto</th>
                <th className="px-6 py-3 font-semibold">Código</th>
                <th className="px-6 py-3 font-semibold">Nome</th>
                <th className="px-6 py-3 font-semibold">Categoria</th>
                <th className="px-6 py-3 font-semibold">Aluguel</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-2">
                    <img
                      src={getThumb(product)}
                      alt="Thumb"
                      className="h-12 w-12 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/50x50?text=Erro";
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {product.code}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category_name || "-"}
                  </td>
                  <td className="px-6 py-4 text-rose-600 font-bold">
                    {formatMoney(product.rental_price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold
                       ${
                         product.status === "available"
                           ? "bg-green-100 text-green-800"
                           : product.status === "rented"
                             ? "bg-blue-100 text-blue-800"
                             : "bg-gray-100 text-gray-800"
                       }`}
                    >
                      {product.status === "available"
                        ? "Disponível"
                        : product.status === "rented"
                          ? "Alugado"
                          : product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/products/edit/${product.id}`)}
                      className="mr-4 font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="font-medium text-red-600 hover:text-red-800 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && products.length === 0 && (
            <div className="p-10 text-center text-gray-500 bg-white">
              <p>Nenhum produto encontrado com os filtros atuais.</p>
              {isGlobal === false && (
                <p className="text-xs mt-2 text-gray-400">
                  Tente marcar "Ver Todas as Lojas".
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Products;
