import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoryService, type Category } from "../../services/categoryService";
import { Edit2, Trash } from "lucide-react";

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await categoryService.getAll(); // O serviço já devolve o array limpo
      setCategories(data);
    } catch {
      alert("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      await categoryService.delete(id);
      setCategories(categories.filter((cat) => cat.id !== id));
      alert("Categoria removida!");
    } catch (error) {
      const apiError = error as { response?: { status?: number; data?: { message?: string } } };
      if (apiError.response?.status === 400) {
        alert(apiError.response.data?.message ?? "Erro ao excluir categoria.");
      } else {
        alert("Erro ao excluir categoria.");
      }
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Gerenciar Categorias
        </h1>
        <Link
          to="/categories/new"
          className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition-colors"
        >
          + Nova Categoria
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full bg-white text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-sm uppercase text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-base text-gray-900">
                  {cat.name}
                </td>
                <td className="px-4 py-2 text-gray-700">{cat.description || "-"}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => navigate(`/categories/edit/${cat.id}`)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                      title="Excluir"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
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
