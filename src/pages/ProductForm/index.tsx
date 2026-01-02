import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService, Category } from '../../services/categoryService';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Listas auxiliares
  const [categories, setCategories] = useState<Category[]>([]);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category_id: '',
    size: '',
    color: '',
    brand: '',
    rental_price: '',
    purchase_price: '',
    status: 'available',
    store_id: '1', // Default loja 1 (pode vir do user context depois)
    is_featured: false
  });

  // Estado separado para arquivos
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    loadDependencies();
    if (id) loadProduct(id);
  }, [id]);

  async function loadDependencies() {
    try {
      const catResponse = await categoryService.getAll();
      setCategories(catResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias');
    }
  }

  async function loadProduct(prodId: string) {
    try {
      setLoading(true);
      const res = await productService.getById(prodId);
      const p = res.data;
      
      setFormData({
        code: p.code,
        name: p.name,
        description: p.description || '',
        category_id: String(p.category_id),
        size: p.size || '',
        color: p.color || '',
        brand: p.brand || '',
        rental_price: String(p.rental_price),
        purchase_price: String(p.purchase_price || ''),
        status: p.status,
        store_id: String(p.store_id),
        is_featured: p.is_featured
      });
    } catch (error) {
      alert('Erro ao carregar produto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Tratamento para checkbox e outros inputs
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Cria o FormData (obrigatório para envio de arquivos)
      const data = new FormData();
      
      // Anexa campos de texto
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, String(value));
      });

      // Anexa imagens (se houver novas selecionadas)
      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
          // 'photos' deve bater com o nome esperado no backend (multer)
          data.append('photos', selectedFiles[i]);
        }
      }

      if (id) {
        await productService.update(id, data);
        alert('Produto atualizado com sucesso!');
      } else {
        await productService.create(data);
        alert('Produto criado com sucesso!');
      }
      navigate('/products');

    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        {id ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-white p-6 rounded-lg shadow-md">
        
        {/* === Identificação === */}
        <div className="md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Informações Básicas</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Código *</label>
          <input type="text" name="code" required value={formData.code} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Produto *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-gray-700">Categoria *</label>
           <select name="category_id" required value={formData.category_id} onChange={handleChange}
             className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none bg-white">
             <option value="">Selecione uma categoria...</option>
             {categories.map(cat => (
               <option key={cat.id} value={cat.id}>{cat.name}</option>
             ))}
           </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        {/* === Detalhes === */}
        <div className="md:col-span-2 mt-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Detalhes & Valores</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tamanho</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="Ex: 38, M, G"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cor</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preço Aluguel (R$) *</label>
          <input type="number" step="0.01" name="rental_price" required value={formData.rental_price} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor de Compra (Custo)</label>
          <input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none" />
        </div>

        {/* === Imagens === */}
        <div className="md:col-span-2 mt-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Fotos</h2>
          <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-rose-500 hover:bg-rose-50">
            <span className="text-gray-500">Clique para selecionar fotos</span>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
          {selectedFiles && (
            <div className="mt-2 text-sm text-gray-600">
              {selectedFiles.length} arquivo(s) selecionado(s)
            </div>
          )}
        </div>

        {/* === Ações === */}
        <div className="md:col-span-2 mt-6 flex items-center justify-between border-t pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              name="is_featured" 
              checked={Boolean(formData.is_featured)} 
              onChange={handleChange}
              className="h-5 w-5 accent-rose-600"
            />
            <span className="text-gray-700">Destaque na Home?</span>
          </label>

          <div className="flex gap-3">
             <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">
               Cancelar
             </button>
             <button type="submit" disabled={loading} className="px-6 py-2 bg-rose-600 rounded text-white hover:bg-rose-700 disabled:opacity-50">
               {loading ? 'Salvando...' : 'Salvar Produto'}
             </button>
          </div>
        </div>

      </form>
    </div>
  );
}
export default ProductForm;

