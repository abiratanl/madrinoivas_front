import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService, type Category } from '../../services/categoryService';

 function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || []);
    } catch (error) {
      alert('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await categoryService.delete(id);
      setCategories(categories.filter(cat => cat.id !== id));
      alert('Categoria removida!');
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        alert('Erro ao excluir categoria.');
      }
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h1>
        <Link 
          to="/categories/new" 
          className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition-colors"
        >
          + Nova Categoria
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{cat.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4">{cat.description || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => navigate(`/categories/edit/${cat.id}`)}
                    className="mr-3 font-medium text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default Categories;