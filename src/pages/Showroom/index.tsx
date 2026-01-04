import { useEffect, useState } from 'react';
import { Heart, X, Check, Search, ShoppingBag, MessageCircle, ChevronLeft } from 'lucide-react';
import { productService, type Product } from '../../services/productService';
import { categoryService, type Category } from '../../services/categoryService';
import { cn } from '../../utils/cn'; 
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="aspect-[3/4] bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

function Showroom() {
  // ==========================================
  // ESTADOS E HOOKS
  // ==========================================
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [storePhone, setStorePhone] = useState<string>('');
  
  // Estados de Filtro
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de Seleção
  const [tryOnList, setTryOnList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // ==========================================
  // CARREGAMENTO DE DADOS (API)
  // ==========================================
  useEffect(() => {
    loadData();
    if (user?.store_id) {
      loadStoreConfig();
    }
  }, [user]);

  async function loadStoreConfig() {
    if (!user?.store_id) return;
    try {
      const token = localStorage.getItem('@MadriNoivas:token');
      const cleanStoreId = String(user.store_id).trim();
      const response = await api.get(`/stores/${cleanStoreId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || response.data;
      const phone = data?.phone || data?.whatsapp;
      if (phone) setStorePhone(phone);
    } catch (error: any) {
      console.error('Erro ao buscar telefone da loja:', error);
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      const [prodData, catData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      const loadedProducts = Array.isArray(prodData) ? prodData : [];
      const loadedCategories = Array.isArray(catData) ? catData : [];
      setProducts(loadedProducts);
      setCategories(loadedCategories);
      
      // Auto-seleciona categoria Noiva por padrão
      const noivaCat = loadedCategories.find(c => 
        c.name.toLowerCase().includes('vestido') && 
        c.name.toLowerCase().includes('noiva')
      );
      if (noivaCat) setFilterCategory(String(noivaCat.id));
    } catch (error) {
      console.error('Erro ao carregar showroom', error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LÓGICA DE NEGÓCIO (FILTROS E SELEÇÃO)
  // ==========================================
  const toggleTryOn = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setTryOnList(prev => {
      const exists = prev.some(item => item.id === product.id);
      return exists ? prev.filter(item => item.id !== product.id) : [...prev, product];
    });
  };

  const filteredProducts = products.filter(p => {
    if (p.status !== 'available') return false;
    if (filterCategory && String(p.category_id) !== filterCategory) return false;
    if (filterSize && p.size !== filterSize) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSendWhatsApp = () => {
    if (tryOnList.length === 0) return;
    if (!storePhone) {
      alert("Atenção: O número de WhatsApp desta unidade não está configurado.");
      return;
    }
    const cleanPhone = storePhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const messageBody = `✨ *ORDEM DE SEPARAÇÃO - MADRI NOIVAS* ✨\n\n` +
      `Olá! Favor separar os seguintes modelos para o tablet de atendimento:\n\n` +
      tryOnList.map(p => `👗 *${p.code}* - ${p.name} (Tam: ${p.size})`).join('\n') +
      `\n\n_Solicitado por: ${user?.name}_`;
    
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(messageBody)}`, '_blank');
  };

  const handleClearList = () => {
    if (window.confirm("Deseja finalizar a seleção e limpar a lista de prova?")) {
      setTryOnList([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      
      {/* ==========================================
          HEADER COM BARRA DE BUSCA E FILTROS
          ========================================== */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b px-6 py-4">
        <div className="container mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Showroom</h1>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Campo de Busca */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar modelo..." 
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-full bg-gray-50 focus:ring-2 focus:ring-rose-500/20 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filtro de Tamanho */}
            <select 
              className="border rounded-full px-4 py-2 text-sm bg-gray-50 outline-none cursor-pointer"
              value={filterSize}
              onChange={e => setFilterSize(e.target.value)}
            >
              <option value="">Todos Tamanhos</option>
              {Array.from(new Set(products.map(p => p.size))).filter(Boolean).sort().map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            {/* Filtro de Categoria */}
            <select 
              className="border rounded-full px-4 py-2 text-sm bg-gray-50 outline-none cursor-pointer"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="">Todas Categorias</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ==========================================
          GRID DE EXPOSIÇÃO DE PRODUTOS
          ========================================== */}
      <div className="container mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredProducts.map(product => {
              const isSelected = tryOnList.some(item => item.id === product.id);
              return (
                <div 
                  key={product.id} 
                  className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border cursor-pointer ${isSelected ? 'border-rose-500 ring-1 ring-rose-500' : 'border-transparent'}`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={product.image_url || 'https://placehold.co/400x600?text=Vestido'} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      onClick={(e) => toggleTryOn(e, product)}
                      className={cn(
                        "absolute top-3 right-3 p-2 rounded-full transition-all backdrop-blur-md z-10",
                        isSelected ? "bg-rose-500 text-white" : "bg-white/80 text-gray-400 hover:text-rose-500"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", isSelected && "fill-current")} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 font-mono">{product.code}</span>
                      <span className="text-xs font-bold text-rose-600">Tam: {product.size}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==========================================
          FOOTER: LISTA DE PROVA (CARRINHO)
          ========================================== */}
      {tryOnList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-lg text-white px-6 py-4 rounded-2xl shadow-2xl z-40 w-[95%] max-w-lg border border-white/10 animate-in slide-in-from-bottom-10">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-rose-400" />
              <span className="text-sm font-bold uppercase tracking-widest">
                Lista de Prova ({tryOnList.length})
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSendWhatsApp} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold py-2 px-3 rounded-full transition-all active:scale-95">
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button onClick={handleClearList} className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold py-2 px-3 rounded-full transition-all active:scale-95">
                Finalizar
              </button>
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
            {tryOnList.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="text-[12px] truncate">{p.name} ({p.code})</span>
                <button onClick={(e) => toggleTryOn(e as any, p)} className="text-gray-400 hover:text-rose-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE DETALHES (IMAGEM FULLSCREEN COM OVERLAY)
          ========================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          
          {/* BOTÃO VOLTAR FLUTUANTE (TOP LEFT) */}
          <button 
            onClick={() => setSelectedProduct(null)}
            className="absolute top-6 left-6 z-[110] flex items-center gap-2 text-white bg-black/40 backdrop-blur-md px-5 py-3 rounded-full hover:bg-black/60 transition-all shadow-xl border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-bold uppercase tracking-widest text-xs">Voltar</span>
          </button>

          {/* CONTAINER DA IMAGEM (OCUPA TELA TODA) */}
          <div className="relative w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center">
            <img 
              src={selectedProduct.image_url || 'https://placehold.co/1200x1800'} 
              alt={selectedProduct.name} 
              className="h-full w-full object-contain"
            />

            {/* OVERLAY DE INFORMAÇÕES (SOBREPOSTO À DIREITA) */}
            <div 
              className="absolute right-0 bottom-0 md:top-0 w-full md:w-[380px] lg:w-[420px] 
                         bg-gradient-to-t md:bg-gradient-to-l from-black/80 via-black/40 to-transparent 
                         flex flex-col justify-end md:justify-center p-8 md:p-12 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6 max-w-full animate-in slide-in-from-right-10 duration-500">
                <div>
                  <span className="inline-block px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md mb-3 shadow-lg">
                    Ref: {selectedProduct.code}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif leading-tight drop-shadow-md">
                    {selectedProduct.name}
                  </h2>
                </div>

                <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-4 md:line-clamp-none drop-shadow-sm">
                  {selectedProduct.description || 'Um modelo exclusivo da nossa coleção Madri Noivas, desenhado para tornar seu momento inesquecível.'}
                </p>
                
                <div className="flex gap-10 py-6 border-y border-white/20">
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Tamanho</p>
                     <p className="text-2xl font-medium">{selectedProduct.size}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Cor</p>
                     <p className="text-2xl font-medium">{selectedProduct.color || 'Padrão'}</p>
                   </div>
                </div>

                {/* BOTÃO DE AÇÃO FLUTUANTE */}
                <div className="pt-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTryOn(e, selectedProduct);
                    }}
                    className={cn(
                      "w-full py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 border",
                      tryOnList.some(i => i.id === selectedProduct.id) 
                        ? "bg-green-600 border-green-400 text-white" 
                        : "bg-white border-white text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    {tryOnList.some(i => i.id === selectedProduct.id) ? (
                      <><Check className="w-6 h-6" /> <span>Selecionado</span></>
                    ) : (
                      <><Heart className="w-6 h-6" /> <span>Adicionar à Prova</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Showroom;