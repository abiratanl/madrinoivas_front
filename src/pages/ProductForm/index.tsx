import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService, type Category } from '../../services/categoryService';
import { storeService, type Store } from '../../services/storeService';
import { ProductFormModal } from './ProductFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(true);

const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category_id: '',
    size: '',
    color: '',
    brand: '',
    rental_price: 0,
    purchase_price: 0,
    status: 'available',
    store_id: '',
    is_featured: false,
    photos: [] as File[],
    existingPhotoIds: [] as string[],
    existingPhotoPreviews: [] as string[],
    mainPhotoIndex: 0,
  });

  const checkUserRole = useCallback(() => {
    try {
      const userJson = localStorage.getItem('@App:user');
      if (userJson) {
        const storedUser = JSON.parse(userJson);
        if (storedUser.role === 'admin' || storedUser.role === 'owner') {
          setIsAdmin(true);
        }
      }
    } catch (e) {
      console.error('Erro ao ler usuário do cache', e);
    }
  }, []);

  const loadStores = useCallback(async () => {
    try {
      const data = await storeService.getAll();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar lojas', error);
    }
  }, []);

  const loadDependencies = useCallback(async () => {
    try {
      const catResponse: any = await categoryService.getAll();
      const list = Array.isArray(catResponse) ? catResponse : (catResponse.data || []);
      setCategories(list);
    } catch (error) {
      console.error('Erro ao carregar categorias', error);
    }
  }, []);

  const loadProduct = useCallback(async (prodId: string) => {
    try {
      setLoading(true);
      const res: any = await productService.getById(prodId);
      const p = res.data || res;

      const existingImages = p.images || [];
      const existingIds = existingImages.map((img: any) => img.id).filter(Boolean);
      const existingPreviews = existingImages.map((img: any) => img.url_thumb || img.url_full).filter(Boolean);
      // Find the main image index
      const mainImageIndex = existingImages.findIndex((img: any) => img.is_main === 1 || img.is_main === true);

      setFormData({
        code: p.code || '',
        name: p.name || '',
        description: p.description || '',
        category_id: p.category_id ? String(p.category_id) : '',
        size: p.size || '',
        color: p.color || '',
        brand: p.brand || '',
        rental_price: p.rental_price ? Number(p.rental_price) : 0,
        purchase_price: p.purchase_price ? Number(p.purchase_price) : 0,
        status: p.status || 'available',
        store_id: p.store_id ? String(p.store_id) : '',
        is_featured: !!p.is_featured,
        photos: [],
        existingPhotoIds: existingIds,
        existingPhotoPreviews: existingPreviews,
        mainPhotoIndex: mainImageIndex >= 0 ? mainImageIndex : 0,
      });

      if (isAdmin) {
        loadStores();
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar produto');
      navigate('/products');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [isAdmin, loadStores, navigate]);

  useEffect(() => {
    checkUserRole();
    loadDependencies();
    if (isAdmin) loadStores();
    if (id) loadProduct(id);
    else {
      setInitialLoad(false);
      if (!isAdmin && user?.store_id) {
        setFormData(prev => ({ ...prev, store_id: String(user.store_id) }));
      }
    }
  }, [id, checkUserRole, loadDependencies, loadStores, loadProduct, isAdmin, user?.store_id]);

  const validateStep1 = useCallback(() => {
    const baseValid = formData.code.trim().length > 0 && formData.name.trim().length > 0;
    if (isAdmin) {
      return baseValid && formData.store_id !== '';
    }
    return baseValid;
  }, [formData, isAdmin]);

  const validateStep2 = useCallback(() => {
    return formData.category_id !== '' && formData.rental_price > 0;
  }, [formData]);

  const validateStep3 = useCallback(() => {
    return true;
  }, []);

  const handleNextStep = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  }, [currentStep, validateStep1, validateStep2]);

  const handlePrevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      if (isAdmin && !formData.store_id) {
        toast.error('Por favor, selecione a Loja de destino.');
        setLoading(false);
        return;
      }

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photos' || key === 'existingPhotoIds') return;
        if (typeof value === 'boolean') {
          data.append(key, value ? '1' : '0');
        } else {
          data.append(key, String(value));
        }
      });

      // Send existing photo IDs for update (so backend knows what to keep)
      if (id && formData.existingPhotoIds && formData.existingPhotoIds.length > 0) {
        data.append('existing_photo_ids', JSON.stringify(formData.existingPhotoIds));
      }

      // Send main photo index so backend knows which image to set as main
      if (formData.mainPhotoIndex !== undefined) {
        data.append('main_photo_index', String(formData.mainPhotoIndex));
      }

      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((file: File) => {
          data.append('photos', file);
        });
      }

      if (id) {
        await productService.update(id, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productService.create(data);
        toast.success('Produto criado com sucesso!');
      }
      setIsModalOpen(false);
      navigate('/products');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar produto. Verifique os campos.');
    } finally {
      setLoading(false);
    }
  }, [formData, id, isAdmin, navigate, validateStep1, validateStep2, validateStep3]);

  if (initialLoad) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-rose-600 font-semibold">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => navigate('/products')}
        isEditing={!!id}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        stores={stores}
        isAdmin={isAdmin}
        handleSubmit={handleSubmit}
        handleNextStep={handleNextStep}
        handlePrevStep={handlePrevStep}
        validateStep1={validateStep1}
        validateStep2={validateStep2}
        validateStep3={validateStep3}
      />
    </div>
  );
}

export default ProductForm;