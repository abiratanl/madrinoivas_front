import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';

function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadCategory(id);
    }
  }, [id]);

  async function loadCategory(categoryId: string) {
    try {
      setLoading(true);
      const response = await categoryService.getById(categoryId);
      const data = response.data;
      setName(data.name);
      setDescription(data.description || '');
    } catch (error) {
      alert('Erro ao carregar categoria');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = { name, description };

    try {
      if (id) {
        await categoryService.update(id, payload);
        alert('Categoria atualizada!');
      } else {
        await categoryService.create(payload);
        alert('Categoria criada!');
      }
      navigate('/categories');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        {id ? 'Editar Categoria' : 'Nova Categoria'}
      </h1>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-gray-700">Nome *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:border-rose-500 focus:outline-none"
            placeholder="Ex: Vestidos de Noiva"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold text-gray-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:border-rose-500 focus:outline-none"
            rows={3}
            placeholder="Descrição opcional..."
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default CategoryForm;

