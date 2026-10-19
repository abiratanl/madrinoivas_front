import { useEffect, useState, useCallback } from 'react';
import { 
  FolderHeart, Plus, Trash2, Edit, X, Check, Image, 
  Loader2, Package, ChevronLeft, ChevronRight, Search, Building2 
} from 'lucide-react';
import { collectionService, type Collection } from '../../services/collectionService';
import { productService, type Product } from '../../services/productService';
import { storeService, type Store } from '../../services/storeService';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ShowroomCollectionsProps {
  selectedStoreId?: string;
}

export function ShowroomCollections({ selectedStoreId }: ShowroomCollectionsProps) {
  const { user, selectedStore, availableStores } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [modalStoreId, setModalStoreId] = useState<string>('');
  
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkCollectionId, setLinkCollectionId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  // Load stores on mount
  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await storeService.getAll();
        setStores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar lojas', error);
      }
    };
    loadStores();
  }, []);

  // Determine effective storeId: modal selection > prop > context
  const storeId = modalStoreId || selectedStoreId || selectedStore?.id;

  useEffect(() => {
    if (storeId) {
      loadData();
    }
  }, [storeId]);

  const loadData = useCallback(async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      const [colData, prodData] = await Promise.all([
        collectionService.getAll({ storeId, isActive: undefined }),
        productService.getAll({ storeId, status: 'available' }),
      ]);
      setCollections(Array.isArray(colData) ? colData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch (error) {
      console.error('Erro ao carregar coleções/produtos', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setCoverImage(null);
    setCoverPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    if (collection.cover_image_url) {
      setCoverPreview(collection.cover_image_url);
    }
    setIsModalOpen(true);
  };

  const openLinkModal = (collection: Collection) => {
    setLinkCollectionId(collection.id);
    setSelectedProductIds([]);
    setLinkSearchTerm('');
    setIsLinkModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsLinkModalOpen(false);
    setEditingCollection(null);
    setLinkCollectionId(null);
    setCoverImage(null);
    setCoverPreview(null);
    setSelectedProductIds([]);
    setLinkSearchTerm('');
  };

  const handleSubmitCollection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handleSubmitCollection called', { modalStoreId });
    if (!modalStoreId) {
      console.log('No modalStoreId');
      toast.error('Selecione uma loja.');
      return;
    }
    
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      console.log('FormData created, entries:', [...formData.entries()]);
      const data = Object.fromEntries(formData.entries()) as Record<string, string>;
      console.log('Form data:', data);
      
      if (!data.name || !data.slug) {
        toast.error('Nome e Slug são obrigatórios');
        return;
      }

      setSaving(true);
      console.log('Sending create request...');
      
      if (editingCollection) {
        const updateData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'cover_image') updateData.append(key, String(value));
        });
        if (coverImage) updateData.append('cover_image', coverImage);
        
        await collectionService.update(editingCollection.id, updateData);
        toast.success('Coleção atualizada!');
      } else {
        const createData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'cover_image') createData.append(key, String(value));
        });
        createData.append('store_id', modalStoreId);
        if (coverImage) createData.append('cover_image', coverImage);
        
await collectionService.create(createData);
      console.log('Create response received');
      toast.success('Coleção criada!');
      }
      
      closeModals();
      loadData();
    } catch (error: unknown) {
      console.error('Erro ao salvar coleção', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Error details:', err.response?.data || err.message || error);
      toast.error('Erro ao salvar coleção: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta coleção?')) return;
    
    try {
      await collectionService.delete(id);
      toast.success('Coleção excluída!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir coleção', error);
      toast.error('Erro ao excluir coleção');
    }
  };

  const handleLinkProducts = async () => {
    if (!linkCollectionId || selectedProductIds.length === 0) return;
    
    try {
      setLinking(true);
      await collectionService.linkProducts(linkCollectionId, selectedProductIds);
      toast.success(`${selectedProductIds.length} produto(s) vinculado(s)!`);
      closeModals();
      loadData();
    } catch (error) {
      console.error('Erro ao vincular produtos', error);
      toast.error('Erro ao vincular produtos');
    } finally {
      setLinking(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter(p => {
    if (p.status !== 'available') return false;
    if (linkSearchTerm && !p.name.toLowerCase().includes(linkSearchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-rose-600" />
            Coleções
          </h1>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Coleção
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {collections.map(collection => (
              <div key={collection.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  {collection.cover_image_url ? (
                    <img 
                      src={collection.cover_image_url} 
                      alt={collection.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FolderHeart className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                      onClick={() => openLinkModal(collection)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow"
                      title="Vincular Produtos"
                    >
                      <Package className="w-4 h-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => openEditModal(collection)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{collection.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      collection.is_active 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {collection.is_active ? 'Ativa na Home' : 'Inativa'}
                    </span>
                    <span className="text-gray-500">
                      {collection.products_count || 0} produtos
                    </span>
                  </div>
                  {collection.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{collection.description}</p>
                  )}
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="col-span-full text-center py-16">
                <FolderHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma coleção cadastrada</h3>
                <p className="text-gray-500 mb-6">Crie sua primeira coleção para agrupar produtos</p>
                <button 
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Criar Coleção
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Coleção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">{editingCollection ? 'Editar Coleção' : 'Nova Coleção'}</h3>
                <button onClick={closeModals} className="text-white hover:text-gray-200"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <form onSubmit={handleSubmitCollection} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Foto de Capa</label>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" id="cover-upload" />
                  <label htmlFor="cover-upload" className="block w-full cursor-pointer">
                    {coverPreview ? (
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(null); }} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"><X className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-rose-500 hover:bg-rose-50 transition-colors">
                        <Image className="w-10 h-10 text-gray-300 mb-2" />
                        <span className="text-gray-500 font-medium">Selecionar imagem</span>
                        <span className="text-xs text-gray-400">PNG, JPG até 5MB</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              {/* Store Selector Dropdown */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Loja *</label>
                <select
                  name="store_id"
                  required
                  value={modalStoreId}
                  onChange={(e) => setModalStoreId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="">Selecione a loja...</option>
                  {stores.map(store => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selecione a loja para esta coleção.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome *</label>
                <input 
                  name="name" 
                  required
                  defaultValue={editingCollection?.name || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: Noivas 2026"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Slug (URL) *</label>
                <input 
                  name="slug" 
                  required
                  defaultValue={editingCollection?.slug || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: noivas-2026"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição</label>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editingCollection?.description || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  placeholder="Descrição da coleção..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="is_active" 
                  defaultChecked={editingCollection?.is_active !== false}
                  className="h-5 w-5 accent-rose-600 rounded"
                  id="is-active"
                />
                <label htmlFor="is-active" className="text-gray-700 font-medium">Exibir na Home Page</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingCollection ? 'Salvar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vincular Produtos */}
      {isLinkModalOpen && linkCollectionId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Vincular Produtos
                </h3>
                <button onClick={closeModals} className="text-white hover:text-gray-200"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-blue-100 mt-1 text-sm">Selecione os produtos para adicionar à coleção</p>
            </div>
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar produto..." 
                  className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  value={linkSearchTerm}
                  onChange={e => setLinkSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <div 
                      key={product.id} 
                      className={cn(
                        "bg-white rounded-xl overflow-hidden shadow-sm border cursor-pointer transition-all",
                        isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-100 hover:shadow-md"
                      )}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                        <img 
                          src={product.image_url || 'https://placehold.co/400x600?text=Produto'} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide",
                            isSelected ? "bg-blue-600 text-white" : "bg-white/90 text-gray-700"
                          )}>
                            {isSelected ? <Check className="w-3 h-3" /> : 'Selecionar'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 font-mono">{product.code}</span>
                          <span className="text-xs font-bold text-rose-600">Tam: {product.size}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum produto encontrado
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <span className="self-center text-sm text-gray-500">{selectedProductIds.length} selecionado(s)</span>
              <button 
                onClick={closeModals}
                className="px-4 py-2 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLinkProducts}
                disabled={linking || selectedProductIds.length === 0}
                className="px-6 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}