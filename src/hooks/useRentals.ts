import { useState, useEffect, useCallback, useRef } from 'react';
import { rentalService, type CreateRentalDTO, type Rental, type RentalProductItem } from '../services/rentalService';
import { customerService } from '../services/customerService';
import { productService, type Product } from '../services/productService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export interface RentalFormData {
  customer_id: string | '';
  start_date: string;
  end_date_scheduled: string;
  products: RentalProductItem[];
  status: 'budget' | 'reserved';
  discount?: number;
}

const initialFormState: RentalFormData = {
  customer_id: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date_scheduled: '',
  products: [],
  status: 'budget',
  discount: 0,
};

export function useRentals() {
  const { selectedStore, user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingRentalId, setEditingRentalId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RentalFormData>(initialFormState);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showInactives, setShowInactives] = useState(false);
  // Cache de detalhes já carregados
  const [rentalDetailsCache, setRentalDetailsCache] = useState<Record<string, Rental>>({});
  const rentalDetailsCacheRef = useRef(rentalDetailsCache);
  rentalDetailsCacheRef.current = rentalDetailsCache;

  const loadRentals = useCallback(async (filters?: { status?: string }) => {
    setLoading(true);
    try {
      const data = await rentalService.getAll(filters);
      // Carrega apenas o resumo - detalhes serão carregados sob demanda
      const normalized = Array.isArray(data) ? data.map((r: any) => ({
        ...r,
        total_price: parseFloat(r.total_amount || '0'),
        items: r.items || [],
        customer_name: r.customer_name || '', // API returns customer_name, not customer_id
      })) : [];
      setRentals(normalized);
    } catch (error) {
      toast.error('Erro ao carregar aluguéis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar detalhes completos de um aluguel sob demanda
  const loadRentalDetails = useCallback(async (id: string) => {
    if (rentalDetailsCacheRef.current[id]) return rentalDetailsCacheRef.current[id];
    
    try {
      const fullRental = await rentalService.getById(id);
      const detailed = {
        ...fullRental,
        total_price: fullRental.total_price || parseFloat(fullRental.total_amount || '0'),
        items: fullRental.items || [],
      };
      setRentalDetailsCache(prev => ({ ...prev, [id]: detailed }));
      return detailed;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do aluguel ${id}:`, error);
      return null;
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await customerService.getAll('', true);
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes', error);
    }
  }, []);

  const loadAvailableProducts = useCallback(async () => {
    try {
      const data = await productService.getAll({ status: 'available' });
      setAvailableProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    }
  }, []);

  useEffect(() => {
    loadRentals();
    loadCustomers();
    loadAvailableProducts();
  }, [loadRentals, loadCustomers, loadAvailableProducts]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    // Filtro é feito localmente no componente via useMemo
    // Não precisa recarregar da API
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    loadRentals({ status: status || undefined });
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingRentalId(null);
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const openEditModal = async (id: string) => {
    try {
      const response = await rentalService.getById(id);
      // API retorna { status: 'success', data: { ...rental } }
      const rental = response.data?.data || response.data || response;
      
      setFormData({
        customer_id: rental.customer_id || '',
        start_date: rental.start_date?.split('T')[0] || '',
        end_date_scheduled: rental.end_date_scheduled?.split('T')[0] || '',
        products: rental.items?.map((item: any) => ({ 
          id: item.product_id || item.productId || item.id, 
          quantity: item.quantity || 1 
        })) || [],
        status: rental.status === 'reserved' ? 'reserved' : 'budget',
        discount: rental.discount || 0,
      });
      setIsEditing(true);
      setEditingRentalId(id);
      setCurrentStep(2); // Start at step 2 (products) since client can't be changed
      setIsModalOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar aluguel');
      console.error(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingRentalId(null);
    setCurrentStep(1);
  };

  const addProduct = (product: Product) => {
    const productId = String(product.id);
    const exists = formData.products.find(p => p.id === productId);
    if (exists) {
      toast.error('Produto já adicionado');
      return;
    }
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { id: productId, quantity: 1 }]
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, quantity } : p)
    }));
  };

  const validateStep1 = () => formData.customer_id !== '';
  const validateStep2 = () => formData.products.length > 0;
  const validateStep3 = () => !!formData.start_date && !!formData.end_date_scheduled;

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast.error('Selecione um cliente');
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Atualizando...' : 'Criando aluguel...');

    // Determine store_id: use selectedStore for admin/owner, or user's store_id for attendants
    const storeId = selectedStore?.id || user?.store_id;
    
    if (!storeId) {
      toast.error('Nenhuma loja selecionada. Selecione uma loja para continuar.', { id: loadingToast });
      return;
    }

    const payload: CreateRentalDTO = {
      customer_id: formData.customer_id,
      start_date: formData.start_date,
      end_date_scheduled: formData.end_date_scheduled,
      products: formData.products,
      status: formData.status,
      store_id: String(storeId),
      discount: parseFloat(String(formData.discount || 0)),
    };

    try {
      let createdRental: any = null;
      if (isEditing && editingRentalId) {
        await rentalService.update(editingRentalId, payload);
        toast.success('Aluguel atualizado!', { id: loadingToast });
        createdRental = { id: editingRentalId };
      } else {
        const response = await rentalService.create(payload);
        toast.success('Aluguel criado!', { id: loadingToast });
        createdRental = response.data?.data || response.data || response;
      }

      closeModal();
      // Clear cache to force fresh data
      setRentalDetailsCache({});
      loadRentals({ status: statusFilter || undefined });
      
      // Return created rental for highlighting
      return createdRental;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao salvar aluguel';
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleReturn = async (id: string) => {
    if (!window.confirm('Confirmar devolução deste aluguel?')) return;
    
    try {
      await rentalService.returnRental(id);
      toast.success('Devolução realizada!');
      loadRentals({ status: statusFilter || undefined });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao devolver');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancelar este aluguel?')) return;
    
    try {
      await rentalService.cancelRental(id);
      toast.success('Aluguel cancelado!');
      loadRentals({ status: statusFilter || undefined });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao cancelar');
    }
  };

  const getProductName = (productId: string) => {
    const product = availableProducts.find(p => String(p.id) === String(productId));
    return product ? `${product.name} (${product.code})` : 'Produto não encontrado';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-50 text-blue-600 border-blue-100',
      picked_up: 'bg-purple-50 text-purple-600 border-purple-100',
      returned: 'bg-green-50 text-green-600 border-green-100',
      late: 'bg-red-50 text-red-600 border-red-100',
      cancelled: 'bg-gray-50 text-gray-400 border-gray-100',
      budget: 'bg-amber-50 text-amber-600 border-amber-100',
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
      reserved: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    };
    return colors[status] || 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      picked_up: 'Retirado',
      returned: 'Devolvido',
      late: 'Atrasado',
      cancelled: 'Cancelado',
      budget: 'Orçamento',
      pending: 'Pendente',
      reserved: 'Reservado',
    };
    return labels[status] || status;
  };

  return {
    rentals,
    customers,
    availableProducts,
    loading,
    formData,
    setFormData,
    isModalOpen,
    setIsModalOpen,
    isEditing,
    currentStep,
    setCurrentStep,
    searchTerm,
    statusFilter,
    showInactives,
    setShowInactives,
    editingRentalId,
    openCreateModal,
    openEditModal,
    closeModal,
    addProduct,
    removeProduct,
    updateProductQuantity,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    handleReturn,
    handleCancel,
    handleSearch,
    handleStatusFilter,
    getProductName,
    getStatusColor,
    getStatusLabel,
    loadRentals,
    loadRentalDetails,
    rentalDetailsCache,
    validateStep1,
    validateStep2,
    validateStep3,
  };
}