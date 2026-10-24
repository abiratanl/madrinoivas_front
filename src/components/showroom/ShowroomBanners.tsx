import { useEffect, useState, useCallback } from 'react';
import { 
  Image, Plus, Trash2, Edit, X, Loader2, 
  ArrowUp, ArrowDown 
} from 'lucide-react';
import { bannerService, type Banner } from '../../services/bannerService';
import { collectionService, type Collection } from '../../services/collectionService';
import { storeService, type Store } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

interface ShowroomBannersProps {
  selectedStoreId?: string;
}

export function ShowroomBanners({ selectedStoreId }: ShowroomBannersProps) {
  const { selectedStore } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [modalStoreId, setModalStoreId] = useState<string>('');

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

  const loadData = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const [bannersData, collectionsData] = await Promise.all([
        bannerService.getAll({ storeId }),
        collectionService.getAll({ storeId }),
      ]);
      setBanners(Array.isArray(bannersData) ? bannersData : []);
      setCollections(Array.isArray(collectionsData) ? collectionsData : []);
    } catch (error) {
      console.error('Erro ao carregar banners', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileImage(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setBannerImage(null);
    setBannerPreview(null);
    setMobileImage(null);
    setMobilePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    if (banner.image_url) setBannerPreview(banner.image_url);
    if (banner.mobile_image_url) setMobilePreview(banner.mobile_image_url!);
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setBannerImage(null);
    setBannerPreview(null);
    setMobileImage(null);
    setMobilePreview(null);
  };

  const handleSubmitBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modalStoreId) {
      toast.error('Selecione uma loja.');
      return;
    }
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    
    if (!data.image_url && !bannerImage && !editingBanner?.image_url) {
      toast.error('Imagem é obrigatória');
      return;
    }

    try {
      setSaving(true);
      
      if (editingBanner) {
        const updateData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image' && key !== 'mobile_image') updateData.append(key, String(value));
        });
        if (bannerImage) updateData.append('image', bannerImage);
        if (mobileImage) updateData.append('mobile_image', mobileImage);
        
        await bannerService.update(editingBanner.id, updateData);
        toast.success('Banner atualizado!');
      } else {
        const createData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'image' && key !== 'mobile_image') createData.append(key, String(value));
        });
        createData.append('store_id', modalStoreId);
        if (bannerImage) createData.append('image', bannerImage);
        if (mobileImage) createData.append('mobile_image', mobileImage);
        
        await bannerService.create(createData);
        toast.success('Banner criado!');
      }
      
      closeModals();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar banner', error);
      toast.error('Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este banner?')) return;
    
    try {
      await bannerService.delete(id);
      toast.success('Banner excluído!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir banner', error);
      toast.error('Erro ao excluir banner');
    }
  };

  const moveBanner = async (id: string, direction: 'up' | 'down') => {
    const current = banners.find(b => b.id === id);
    if (!current) return;
    
    const index = banners.findIndex(b => b.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    
    const target = banners[targetIndex];
    
    try {
      await Promise.all([
        bannerService.update(id, { position: target.position }),
        bannerService.update(target.id, { position: current.position }),
      ]);
      loadData();
    } catch (error) {
      console.error('Erro ao mover banner', error);
      toast.error('Erro ao reordenar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
            <Image className="w-6 h-6 text-rose-600" />
            Banners da Home
          </h1>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-full hover:bg-rose-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Banner
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {banners.map((banner, index) => (
              <div key={banner.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-64 md:w-72 flex-shrink-0 relative">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title || 'Banner'} 
                      className="w-full h-full object-cover aspect-video"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{banner.position}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-gray-900">{banner.title || 'Sem título'}</h3>
                        {banner.subtitle && <p className="text-gray-500 text-sm mt-1">{banner.subtitle}</p>}
                        {banner.collection_name && (
                          <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                            Coleção: {banner.collection_name}
                          </span>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            banner.is_active 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {banner.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                          <span>Ordem: {banner.position}</span>
                          {banner.start_at && (
                            <span>Início: {new Date(banner.start_at).toLocaleDateString('pt-BR')}</span>
                          )}
                          {banner.end_at && (
                            <span>Fim: {new Date(banner.end_at).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveBanner(banner.id, 'up')}
                          disabled={index === 0}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => moveBanner(banner.id, 'down')}
                          disabled={index === banners.length - 1}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => openEditModal(banner)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-1.5 bg-gray-100 hover:bg-red-100 rounded-lg text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="text-center py-16">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum banner cadastrado</h3>
                <p className="text-gray-500 mb-6">Crie seu primeiro banner para o carrossel da Home</p>
                <button 
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Criar Banner
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-rose-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h3>
                <button onClick={closeModals} className="text-white hover:text-gray-200"><X className="w-6 h-6" /></button>
              </div>
            </div>
            <form onSubmit={handleSubmitBanner} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Imagem Desktop *</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="banner-upload" />
                    <label htmlFor="banner-upload" className="block w-full cursor-pointer">
                      {bannerPreview ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden">
                          <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setBannerImage(null); setBannerPreview(null); }} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-rose-500 hover:bg-rose-50 transition-colors">
                          <Image className="w-10 h-10 text-gray-300 mb-2" />
                          <span className="text-gray-500 font-medium">Selecionar imagem</span>
                          <span className="text-xs text-gray-400">PNG, JPG até 5MB (1920x1080)</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Imagem Mobile (Opcional)</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleMobileImageChange} className="hidden" id="mobile-upload" />
                    <label htmlFor="mobile-upload" className="block w-full cursor-pointer">
                      {mobilePreview ? (
                        <div className="relative aspect-[9/16] rounded-xl overflow-hidden max-w-xs">
                          <img src={mobilePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { setMobileImage(null); setMobilePreview(null); }} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="aspect-[9/16] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:border-rose-500 hover:bg-rose-50 transition-colors max-w-xs">
                          <Image className="w-10 h-10 text-gray-300 mb-2" />
                          <span className="text-gray-500 font-medium">Selecionar imagem</span>
                          <span className="text-xs text-gray-400">PNG, JPG até 5MB (9:16)</span>
                        </div>
                      )}
                    </label>
                  </div>
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
                <p className="text-xs text-gray-500 mt-1">Selecione a loja para este banner.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título</label>
                <input 
                  name="title" 
                  defaultValue={editingBanner?.title || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Título principal do slide"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Subtítulo</label>
                <input 
                  name="subtitle" 
                  defaultValue={editingBanner?.subtitle || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Texto secundário no overlay"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Link de Destino (Opcional)</label>
                <input 
                  name="link_url" 
                  defaultValue={editingBanner?.link_url || ''}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="/colecao/noivas-2026 ou https://wa.me/..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Texto do Botão</label>
                  <input 
                    name="button_text" 
                    defaultValue={editingBanner?.button_text || ''}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Ver Coleção"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estilo do Botão</label>
                  <select 
                    name="button_variant" 
                    defaultValue={editingBanner?.button_variant || 'primary'}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="primary">Primário (Preenchido)</option>
                    <option value="outline">Outline (Contorno)</option>
                    <option value="ghost">Ghost (Transparente)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Posição do Overlay</label>
                  <select 
                    name="overlay_position" 
                    defaultValue={editingBanner?.overlay_position || 'center'}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cor do Overlay (Hex + Alpha)</label>
                  <input 
                    name="overlay_bg_color" 
                    type="color"
                    defaultValue={editingBanner?.overlay_bg_color || '#00000080'}
                    className="w-full h-10 px-2 py-1 rounded-lg border border-gray-200 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cor do Texto</label>
                  <input 
                    name="text_color" 
                    type="color"
                    defaultValue={editingBanner?.text_color || '#FFFFFF'}
                    className="w-full h-10 px-2 py-1 rounded-lg border border-gray-200 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ordem</label>
                  <input 
                    name="position" 
                    type="number"
                    defaultValue={editingBanner?.position || 0}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Início da Exibição</label>
                  <input 
                    name="start_at" 
                    type="datetime-local"
                    defaultValue={editingBanner?.start_at ? editingBanner.start_at.slice(0, 16) : ''}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Fim da Exibição</label>
                  <input 
                    name="end_at" 
                    type="datetime-local"
                    defaultValue={editingBanner?.end_at ? editingBanner.end_at.slice(0, 16) : ''}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Coleção (Link Interno)</label>
                  <select 
                    name="collection_id" 
                    defaultValue={editingBanner?.collection_id || ''}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="">Nenhuma</option>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      defaultChecked={editingBanner?.is_active !== false}
                      className="h-5 w-5 accent-rose-600 rounded"
                    />
                    <span className="text-gray-700 font-medium">Ativo</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input 
                      type="checkbox" 
                      name="target_blank" 
                      defaultChecked={editingBanner?.target_blank}
                      className="h-5 w-5 accent-rose-600 rounded"
                    />
                    <span className="text-gray-700 font-medium">Abrir em nova aba</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingBanner ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


