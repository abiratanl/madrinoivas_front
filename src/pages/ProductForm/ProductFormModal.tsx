import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronLeft, Image, Tag, DollarSign, Package, Store as StoreIcon, ArrowLeft, ArrowRight, Camera, Upload, Star } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { cn } from '../../utils/cn';
import type { Category } from '../../services/categoryService';
import type { Store } from '../../services/storeService';

// Stable custom input component for NumericFormat - defined outside to maintain referential equality
function NumericFormatCustomInput({ inputRef, onChange, onFocus, onBlur, required, placeholder, className, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { 
  inputRef: React.Ref<HTMLInputElement>; 
  onChange: React.ChangeEventHandler<HTMLInputElement>; 
  onFocus: React.FocusEventHandler<HTMLInputElement>; 
  onBlur: React.FocusEventHandler<HTMLInputElement>; 
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      required={required}
      placeholder={placeholder}
      className={className}
      {...rest}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

// Currency Input Component using react-number-format
function CurrencyInputBR({ 
  value, 
  onChange, 
  label, 
  required = false,
  placeholder = '0,00'
}: { 
  value: number; 
  onChange: (value: number) => void; 
  label: string; 
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
      <NumericFormat
        customInput={NumericFormatCustomInput}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        value={value}
        onValueChange={(values: { floatValue?: number; formattedValue?: string; value?: string }) => {
          onChange(values.floatValue ?? 0);
        }}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 text-right"
      />
    </div>
  );
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: {
    code: string;
    name: string;
    description: string;
    category_id: string;
    size: string;
    color: string;
    brand: string;
    rental_price: number;
    purchase_price: number;
    status: string;
    store_id: string;
    is_featured: boolean;
    photos: File[];
    existingPhotoIds: string[];
    existingPhotoPreviews: string[];
    mainPhotoIndex: number;
  };
  setFormData: (data: any) => void;
  categories: Category[];
  stores: Store[];
  isAdmin: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateStep3: () => boolean;
}

export function ProductFormModal({
  isOpen, onClose, isEditing, currentStep, setCurrentStep,
  formData, setFormData, categories, stores, isAdmin,
  handleSubmit, handleNextStep, handlePrevStep,
  validateStep1, validateStep2, validateStep3,
}: ProductFormModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const [existingPreviews, setExistingPreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(formData.mainPhotoIndex || 0);

  useEffect(() => {
    setMainImageIndex(formData.mainPhotoIndex || 0);
  }, [formData.mainPhotoIndex]);

  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [filePreview, setFilePreview] = useState<{ files: File[]; previews: string[] } | null>(null);
  const [filePreviewMainIndex, setFilePreviewMainIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }, 
        audio: false 
      });
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error);
      };
    }
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraStream) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const preview = URL.createObjectURL(blob);
          setCapturedPhoto(preview);
        }
      }, 'image/jpeg', 0.9);
    }
    // Don't stop camera here - keep showCamera true for preview
  };

  const confirmCapture = () => {
    if (!capturedPhoto) return;
    
    // Convert blob URL back to File
    fetch(capturedPhoto)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const newFiles = [...selectedFiles, file];
        setSelectedFiles(newFiles);
        setImagePreviews(prev => [...prev, capturedPhoto]);
        setFormData({ ...formData, photos: newFiles });
        setCapturedPhoto(null);
        stopCamera();
      });
  };

  const discardCapture = () => {
    if (capturedPhoto) {
      URL.revokeObjectURL(capturedPhoto);
      setCapturedPhoto(null);
    }
    // Restart camera for another attempt
    startCamera();
  };

  const [initialPhotosLoaded, setInitialPhotosLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) setCurrentStep(1);
  }, [isOpen, setCurrentStep]);

  useEffect(() => {
    if (formData.photos && formData.photos.length > 0 && !initialPhotosLoaded) {
      setSelectedFiles(formData.photos);
      const previews = formData.photos.map((file: File) => URL.createObjectURL(file));
      setImagePreviews(previews);
      setInitialPhotosLoaded(true);
    }
  }, [formData.photos, initialPhotosLoaded]);

  // Load existing photo IDs and previews from backend (for editing)
  useEffect(() => {
    if (isEditing && formData.existingPhotoIds && formData.existingPhotoIds.length > 0) {
      setExistingPhotoIds(formData.existingPhotoIds);
      setExistingPreviews(formData.existingPhotoPreviews || []);
    }
  }, [isEditing, formData.existingPhotoIds, formData.existingPhotoPreviews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const previews = newFiles.map(file => URL.createObjectURL(file));
      setFilePreview({ files: newFiles, previews });
      setFilePreviewMainIndex(0);
    }
    // Reset input value to allow selecting same file again
    if (e.target) e.target.value = '';
  };

  const confirmFilePreview = () => {
    if (!filePreview) return;
    const combinedFiles = [...selectedFiles, ...filePreview.files];
    const combinedPreviews = [...imagePreviews, ...filePreview.previews];
    setSelectedFiles(combinedFiles);
    setImagePreviews(combinedPreviews);
    setFormData({ ...formData, photos: combinedFiles });
    setFilePreview(null);
    setFilePreviewMainIndex(0);
  };

  const discardFilePreview = () => {
    if (filePreview) {
      filePreview.previews.forEach(url => URL.revokeObjectURL(url));
    }
    setFilePreview(null);
    setFilePreviewMainIndex(0);
  };

  const setFilePreviewMain = (index: number) => {
    setFilePreviewMainIndex(index);
  };

  const removeImage = (index: number) => {
    const totalExisting = existingPreviews.length;
    
    if (index < totalExisting) {
      // Removing an existing photo from backend
      const newExistingIds = existingPhotoIds.filter((_, i) => i !== index);
      const newExistingPreviews = existingPreviews.filter((_, i) => i !== index);
      setExistingPhotoIds(newExistingIds);
      setExistingPreviews(newExistingPreviews);
      setFormData({ 
        ...formData, 
        existingPhotoIds: newExistingIds,
        existingPhotoPreviews: newExistingPreviews,
      });
      
      // Adjust main image index if needed
      if (mainImageIndex >= index) {
        setMainImageIndex(prev => prev > 0 ? prev - 1 : 0);
      }
    } else {
      // Removing a new uploaded photo
      const newFileIndex = index - totalExisting;
      const newFiles = selectedFiles.filter((_, i) => i !== newFileIndex);
      const newPreviews = imagePreviews.filter((_, i) => i !== newFileIndex);
      setSelectedFiles(newFiles);
      setImagePreviews(newPreviews);
      setFormData({ ...formData, photos: newFiles });
      
      // Adjust main image index if needed
      if (mainImageIndex >= index) {
        setMainImageIndex(prev => prev > 0 ? prev - 1 : 0);
      }
    }
  };

  const setMainImage = (index: number) => {
    setMainImageIndex(index);
    setFormData({ ...formData, mainPhotoIndex: index });
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER E PROGRESSO */}
        <div className="bg-rose-600 p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h3>
            <button onClick={handleClose} className="text-white hover:text-gray-200"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex items-center justify-between relative px-4 text-white">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                  currentStep >= step ? "bg-white text-rose-600 border-white" : "bg-rose-400 text-rose-100 border-rose-400"
                )}>
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">
                  {step === 1 ? 'Básico' : step === 2 ? 'Detalhes' : 'Imagens'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-rose-400 -z-0" />
          </div>
        </div>

        {/* FORMULÁRIO COM SCROLL */}
        <form id="product-form" className="flex-1 overflow-y-auto p-6 space-y-6" onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }} onSubmit={handleSubmit}>
          
          {/* PASSO 1: INFORMAÇÕES BÁSICAS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <h4 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" /> Informações Básicas
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Código *</label>
                    <input
                      type="text"
                      name="code"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Ex: VST-001"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome do Produto *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Ex: Vestido de Noiva Sereia"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descrição</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                    placeholder="Descrição detalhada do produto..."
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Loja de Destino *</label>
                    <select
                      name="store_id"
                      required
                      value={formData.store_id}
                      onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="">Selecione a Loja...</option>
                      {stores.map(store => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-blue-600 mt-1">Como administrador, você deve definir a qual unidade este produto pertence.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASSO 2: DETALHES E VALORES */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" /> Detalhes do Produto
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tamanho</label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Ex: 38, M, G, Único"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cor</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Ex: Branco, Marfim, Preto"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Marca</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="Ex: Pronovias, Rosa Clará"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Categoria *</label>
                    <select
                      name="category_id"
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="">Selecione...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <CurrencyInputBR
                      label="Preço Aluguel (R$) *"
                      value={formData.rental_price}
                      onChange={(val) => setFormData({ ...formData, rental_price: val })}
                      required
                    />
                  </div>
                  <div>
                    <CurrencyInputBR
                      label="Valor de Compra (Custo)"
                      value={formData.purchase_price}
                      onChange={(val) => setFormData({ ...formData, purchase_price: val })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="available">Disponível</option>
                      <option value="reserved">Reservado</option>
                      <option value="maintenance">Manutenção</option>
                      <option value="discarded">Descartado</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="h-5 w-5 accent-rose-600 rounded"
                      />
                      <span className="text-gray-700 font-medium">Destaque na Home?</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* RESUMO DOS VALORES */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4">Resumo</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Preço Aluguel</p>
                    <p className="font-bold text-gray-900">{formatPrice(formData.rental_price)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Custo</p>
                    <p className="font-bold text-gray-900">{formatPrice(formData.purchase_price)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Categoria</p>
                    <p className="font-medium text-gray-900">{categories.find(c => String(c.id) === formData.category_id)?.name || 'Não selecionada'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize text-gray-900">{formData.status}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: IMAGENS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" /> Fotos do Produto
                </h4>
                <p className="text-sm text-gray-600 mb-4">Adicione fotos do produto. A primeira foto será a capa.</p>

                {/* Camera Capture */}
                {showCamera && (
                  <div className="mb-4">
                    {capturedPhoto ? (
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <img
                          src={capturedPhoto}
                          alt="Captured photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={discardCapture}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Descartar
                          </button>
                          <button
                            type="button"
                            onClick={confirmCapture}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Usar Foto
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Capturar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* File Preview - compact inline preview */}
                {filePreview && (
                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                          <Image className="w-5 h-5" /> Pré-visualização
                        </h4>
                        <span className="text-xs text-gray-500">{filePreview.files.length} arquivo(s)</span>
                      </div>
                      <div className="relative bg-black rounded-lg overflow-hidden aspect-video max-w-md mx-auto">
                        <img
                          src={filePreview.previews[filePreviewMainIndex]}
                          alt="File preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Navigation for multiple files */}
                        {filePreview.previews.length > 1 && (
                          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                            {filePreview.previews.map((_, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setFilePreviewMain(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === filePreviewMainIndex
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={discardFilePreview}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Descartar
                          </button>
                          <button
                            type="button"
                            onClick={confirmFilePreview}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Usar Foto(s)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!showCamera && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* File Upload */}
                    <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-rose-500 hover:bg-rose-50 transition-colors">
                      <Upload className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <span className="text-gray-500 font-medium block mb-1">Selecionar arquivos</span>
                      <span className="text-xs text-gray-400">PNG, JPG até 5MB cada</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-rose-500 hover:bg-rose-50 transition-colors flex flex-col items-center gap-2"
                    >
                      <Camera className="w-10 h-10 mx-auto text-gray-300" />
                      <span className="text-gray-500 font-medium">Tirar foto agora</span>
                      <span className="text-xs text-gray-400">Usar câmera do dispositivo</span>
                    </button>
                  </div>
                )}

                {(selectedFiles.length > 0 || existingPreviews.length > 0) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {existingPreviews.length + selectedFiles.length} foto(s) total
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {/* Existing photos from backend */}
                      {existingPreviews.map((preview, index) => {
                        const globalIndex = index;
                        const isMain = mainImageIndex === globalIndex;
                        return (
                          <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={preview} alt={`Existing ${index + 1}`} className="w-full h-full object-cover" />
                            {/* Mobile: always visible action bar at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between md:hidden">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(globalIndex)}
                                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                                  title="Definir como capa"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(globalIndex)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Excluir"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Desktop: center overlay on hover */}
                            <div className="hidden md:absolute md:inset-0 md:bg-black/50 md:flex md:items-center md:justify-center md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:flex-col md:gap-2 md:p-2">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(globalIndex)}
                                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                                  title="Definir como capa"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(globalIndex)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Excluir"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-rose-600 text-white text-xs px-1.5 py-0.5 rounded">Capa</span>
                            )}
                          </div>
                        );
                      })}
                      {/* New uploaded photos */}
                      {imagePreviews.map((preview, index) => {
                        const globalIndex = existingPreviews.length + index;
                        const isMain = mainImageIndex === globalIndex;
                        return (
                          <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            {/* Mobile: always visible action bar at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between md:hidden">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(globalIndex)}
                                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                                  title="Definir como capa"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(globalIndex)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Excluir"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {/* Desktop: center overlay on hover */}
                            <div className="hidden md:absolute md:inset-0 md:bg-black/50 md:flex md:items-center md:justify-center md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:flex-col md:gap-2 md:p-2">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() => setMainImage(globalIndex)}
                                  className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                                  title="Definir como capa"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(globalIndex)}
                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                title="Excluir"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-rose-600 text-white text-xs px-1.5 py-0.5 rounded">Capa</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {(currentStep > 1 && !isEditing) || (currentStep === 3 && isEditing) ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-6 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3 ml-auto">
            {currentStep < 3 ? (
              <button
                type="button"
                disabled={currentStep === 1 ? !validateStep1() : !validateStep2()}
                onClick={handleNextStep}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2",
                  (currentStep === 1 ? validateStep1() : validateStep2())
                    ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="product-form"
                disabled={!validateStep1() || !validateStep2() || !validateStep3()}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2",
                  (validateStep1() && validateStep2() && validateStep3())
                    ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}