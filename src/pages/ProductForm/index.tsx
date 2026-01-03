import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService, type Category } from '../../services/categoryService';
import { storeService } from '../../services/storeService'; 

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Estados de Controle de Acesso
  const [isAdmin, setIsAdmin] = useState(false);

  // Listas auxiliares
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<any[]>([]); 

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
    store_id: '', 
    is_featured: false
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    checkUserRole(); // 1. Verifica permissões
    loadDependencies(); 
    if (id) loadProduct(id); 
  }, [id]);

  // --- CORREÇÃO AQUI: Lendo a chave correta '@App:user' ---
  function checkUserRole() {
    try {
      // Aqui estava o erro: mudamos de 'user' para '@App:user'
      const userJson = localStorage.getItem('@App:user'); 
      
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log("Usuário logado:", user); // Debug

        // Verifica se é admin ou owner
        if (user.role === 'admin' || user.role === 'owner') {
          setIsAdmin(true);
          loadStores(); // Carrega o dropdown
        }
      }
    } catch (e) {
      console.error('Erro ao ler usuário do cache', e);
    }
  }

  async function loadStores() {
    try {
      const data = await storeService.getAll();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar lojas', error);
    }
  }

  async function loadDependencies() {
    try {
      const catResponse: any = await categoryService.getAll();
      const list = Array.isArray(catResponse) ? catResponse : (catResponse.data || []);
      setCategories(list);
    } catch (error) {
      console.error('Erro ao carregar categorias', error);
    }
  }

  async function loadProduct(prodId: string) {
    try {
      setLoading(true);
      const res: any = await productService.getById(prodId);
      const p = res.data || res; 
      
      setFormData({
        code: p.code || '',
        name: p.name || '',
        description: p.description || '',
        category_id: p.category_id ? String(p.category_id) : '',
        size: p.size || '',
        color: p.color || '',
        brand: p.brand || '',
        rental_price: p.rental_price ? String(p.rental_price) : '',
        purchase_price: p.purchase_price ? String(p.purchase_price) : '',
        status: p.status || 'available',
        store_id: p.store_id ? String(p.store_id) : '',
        is_featured: !!p.is_featured
      });
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar produto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação Extra para Admin
      if (isAdmin && !formData.store_id) {
        alert('Por favor, selecione a Loja de destino.');
        setLoading(false);
        return;
      }

      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
            data.append(key, value ? '1' : '0');
        } else {
            data.append(key, String(value));
        }
      });

      if (selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 bg-white p-6 rounded-lg shadow-md border border-gray-100">
        
        {/* === Informações Básicas === */}
        <div className="md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Informações Básicas</h2>
        </div>

        {/* --- CAMPO DE LOJA (VISÍVEL APENAS PARA ADMIN) --- */}
        {isAdmin && (
          <div className="md:col-span-2 bg-blue-50 p-4 rounded-md border border-blue-100">
             <label className="block text-sm font-bold text-gray-800 mb-1">Loja de Destino *</label>
             <select 
               name="store_id" 
               required={isAdmin} 
               value={formData.store_id} 
               onChange={handleChange}
               className="w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 bg-white"
             >
               <option value="">Selecione a Loja...</option>
               {stores.map(store => (
                 <option key={store.id} value={store.id}>{store.name}</option>
               ))}
             </select>
             <p className="text-xs text-blue-600 mt-1">Como administrador, você deve definir a qual unidade este produto pertence.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Código *</label>
          <input type="text" name="code" required value={formData.code} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nome do Produto *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-gray-700">Categoria *</label>
           <select name="category_id" required value={formData.category_id} onChange={handleChange}
             className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white">
             <option value="">Selecione uma categoria...</option>
             {categories.map(cat => (
               <option key={cat.id} value={cat.id}>{cat.name}</option>
             ))}
           </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        {/* === Detalhes === */}
        <div className="md:col-span-2 mt-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Detalhes & Valores</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tamanho</label>
          <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="Ex: 38, M, G"
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cor</label>
          <input type="text" name="color" value={formData.color} onChange={handleChange} 
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preço Aluguel (R$) *</label>
          <input type="number" step="0.01" name="rental_price" required value={formData.rental_price} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor de Compra (Custo)</label>
          <input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleChange}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
        </div>

        {/* === Imagens === */}
        <div className="md:col-span-2 mt-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 border-b pb-2">Fotos</h2>
          <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-rose-500 hover:bg-rose-50 transition-colors">
            <span className="text-gray-500 font-medium">Clique para selecionar fotos</span>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange} 
              className="hidden" 
            />
          </label>
          {selectedFiles && (
            <div className="mt-2 text-sm text-rose-600 font-medium">
              {selectedFiles.length} arquivo(s) selecionado(s) para envio
            </div>
          )}
        </div>

        {/* === Ações === */}
        <div className="md:col-span-2 mt-6 flex items-center justify-between border-t pt-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              name="is_featured" 
              checked={Boolean(formData.is_featured)} 
              onChange={handleChange}
              className="h-5 w-5 accent-rose-600 rounded"
            />
            <span className="text-gray-700 font-medium">Destaque na Home?</span>
          </label>

          <div className="flex gap-3">
             <button type="button" onClick={() => navigate('/products')} className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition-colors">
               Cancelar
             </button>
             <button type="submit" disabled={loading} className="px-6 py-2 bg-rose-600 rounded text-white hover:bg-rose-700 disabled:opacity-50 transition-colors font-medium shadow-sm">
               {loading ? 'Salvando...' : 'Salvar Produto'}
             </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default ProductForm;