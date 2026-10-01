import React, { useState, useEffect, useRef } from 'react';
import { X, Check, User, Package, Calendar, ChevronLeft, Trash2, Plus, Minus, Search } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { Customer } from '../../../types/customer';
import type { Product } from '../../../services/productService';
import type { RentalProductItem } from '../../../services/rentalService';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-day-picker/src/style.css';
import { NumericFormat } from 'react-number-format';

interface RentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: {
    customer_id: string | '';
    start_date: string;
    end_date_scheduled: string;
    products: RentalProductItem[];
    status: 'budget' | 'reserved';
    discount?: number;
    penalty_fee?: number;
    notes?: string;
  };
  setFormData: (data: any) => void;
  customers: Customer[];
  availableProducts: Product[];
  handleSubmit: (e: React.FormEvent) => void;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  validateStep1: () => boolean;
  validateStep2: () => boolean;
  validateStep3: () => boolean;
  getProductName: (id: string) => string;
}

// Date Picker Component with dd/mm/yyyy format and calendar
function DatePickerBR({ 
  value, 
  onChange, 
  label, 
  minDate, 
  required = false,
  placeholder = 'dd/mm/aaaa'
}: { 
  value: string; 
  onChange: (date: string) => void; 
  label: string; 
  minDate?: string; 
  required?: boolean;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const parseBRDate = (str: string): Date | null => {
    const parsed = parse(str, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed : null;
  };

  const parseISODate = (str: string): Date | null => {
    const parsed = parse(str, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : null;
  };

  const formatBRDate = (date: Date): string => format(date, 'dd/MM/yyyy', { locale: ptBR });
  const formatISODate = (date: Date): string => format(date, 'yyyy-MM-dd');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '/' + val.slice(5);
    e.target.value = val;
    const date = parseBRDate(val);
    if (date) onChange(formatISODate(date));
    else if (val === '') onChange('');
  };

  const handleBlur = () => {
    if (inputRef.current?.value) {
      const date = parseBRDate(inputRef.current.value);
      if (date) inputRef.current.value = formatBRDate(date);
      else { inputRef.current.value = ''; onChange(''); }
    }
    setIsOpen(false);
  };

  const handleDayClick = (day: Date | undefined) => {
    if (!day) return;
    onChange(formatISODate(day));
    setIsOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const min = minDate ? (parseISODate(minDate) || undefined) : undefined;

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          required={required}
          placeholder={placeholder}
          maxLength={10}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 pr-12"
          value={value ? formatBRDate(parseISODate(value)!) : ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
        />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600" onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }} tabIndex={-1}>
          <Calendar className="w-5 h-5" />
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <DayPicker mode="single" selected={value ? parseISODate(value) || undefined : undefined} onSelect={handleDayClick} locale={ptBR} required={false} />
        </div>
      )}
    </div>
  );
}

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

export function RentalModal({
  isOpen, onClose, isEditing, currentStep, setCurrentStep,
  formData, setFormData, customers, availableProducts,
  handleSubmit, addProduct, removeProduct, updateProductQuantity,
  handleNextStep, handlePrevStep, validateStep1, validateStep2, validateStep3,
  getProductName,
}: RentalModalProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    if (!isOpen) setCurrentStep(1);
  }, [isOpen, setCurrentStep]);

  if (!isOpen) return null;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.cpf?.includes(customerSearch)
  );

  const filteredProducts = availableProducts.filter(p => {
    const inRental = formData.products.some(rp => String(rp.id) === String(p.id));
    if (inRental) return false;
    if (productSearch && !p.name.toLowerCase().includes(productSearch.toLowerCase())) return false;
    if (selectedCategory && String(p.category_id) !== selectedCategory) return false;
    return p.status === 'available';
  });

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData({ ...formData, customer_id: customer.id });
    setCustomerSearch('');
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const calculateSubtotal = () => {
    return formData.products.reduce((sum, item) => {
      const product = availableProducts.find(p => String(p.id) === String(item.id));
      return sum + (product?.rental_price || 0) * (item.quantity || 1);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - (formData.discount || 0);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* HEADER E PROGRESSO */}
        <div className="bg-rose-600 p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">{isEditing ? 'Editar Aluguel' : 'Novo Aluguel'}</h3>
            <button onClick={handleClose}><X className="w-6 h-6" /></button>
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
                  {step === 1 ? 'Cliente' : step === 2 ? 'Produtos' : 'Datas'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-rose-400 -z-0" />
          </div>
        </div>

        {/* FORMULÁRIO COM SCROLL */}
        <form id="rental-form" className="flex-1 overflow-y-auto p-6 space-y-6" onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
          
          {/* PASSO 1: SELEÇÃO DO CLIENTE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <h4 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" /> Selecionar Cliente
                </h4>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CPF..."
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-rose-500 border border-gray-200"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCustomers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum cliente encontrado</p>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className={cn(
                          "w-full p-4 rounded-xl border transition-all text-left",
                          formData.customer_id === customer.id
                            ? "bg-rose-50 border-rose-300 ring-1 ring-rose-500"
                            : "bg-white border-gray-100 hover:border-rose-200 hover:bg-rose-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.cpf || 'CPF não informado'}</p>
                          </div>
                          {formData.customer_id === customer.id && (
                            <Check className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {formData.customer_id && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="font-medium text-green-700">Cliente selecionado: {customers.find(c => c.id === formData.customer_id)?.name}</p>
                </div>
              )}
            </div>
          )}

          {/* PASSO 2: SELEÇÃO DE PRODUTOS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              {/* PRODUTOS ADICIONADOS */}
              {formData.products.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" /> Produtos no Aluguel ({formData.products.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.products.map((item) => {
                      const product = availableProducts.find(p => String(p.id) === String(item.id));
                      return (
                        <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            {product?.image_url && (
                              <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{getProductName(item.id)}</p>
                              <p className="text-xs text-gray-500">Tam: {product?.size} • R$ {product?.rental_price || 0}/dia</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(item.id, (item.quantity || 1) - 1)}
                              disabled={(item.quantity || 1) <= 1}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold">{item.quantity || 1}</span>
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(item.id, (item.quantity || 1) + 1)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProduct(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-right text-lg font-bold text-gray-800">
                    Total estimado: {formatPrice(calculateTotal())}
                  </div>
                </div>
              )}

              {/* BUSCA E FILTROS DE PRODUTOS */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-rose-500" /> Adicionar Produtos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar produto..."
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-xl outline-none focus:ring-2 focus:ring-rose-500 border border-gray-200"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 bg-white rounded-xl outline-none focus:ring-2 focus:ring-rose-500 border border-gray-200"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Todas Categorias</option>
                    {Array.from(new Set(availableProducts.map(p => p.category_id))).map(catId => (
                      <option key={catId} value={catId}>Categoria {catId}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 p-2 text-left"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative mb-2">
                        <img 
                          src={product.image_url || 'https://placehold.co/200x300?text=Vestido'} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 truncate text-sm">{product.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 font-mono">{product.code}</span>
                        <span className="text-xs font-bold text-rose-600">Tam: {product.size}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-800 mt-1">{formatPrice(product.rental_price)}/dia</p>
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Nenhum produto disponível
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: DATAS E CONFIRMAÇÃO */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePickerBR
                    label="Data de Início *"
                    value={formData.start_date}
                    onChange={(date) => setFormData({ ...formData, start_date: date })}
                    minDate={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <DatePickerBR
                    label="Data de Devolução Prevista *"
                    value={formData.end_date_scheduled}
                    onChange={(date) => setFormData({ ...formData, end_date_scheduled: date })}
                    minDate={formData.start_date || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {/* Status, Desconto e Multa na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'budget' | 'reserved' })}
                  >
                    <option value="budget">Orçamento</option>
                    <option value="reserved">Reservado</option>
                  </select>
                </div>

                <CurrencyInputBR
                  label="Desconto (R$)"
                  value={formData.discount || 0}
                  onChange={(val) => setFormData({ ...formData, discount: val })}
                  required
                />

                <CurrencyInputBR
                  label="Multa por Atraso (R$)"
                  value={formData.penalty_fee || 0}
                  onChange={(val) => setFormData({ ...formData, penalty_fee: val })}
                  required
                />
              </div>

              {/* Observações */}
              <div className="w-full md:col-span-3">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Observações</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Observações ou detalhes do aluguel..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* RESUMO */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-4">Resumo do Aluguel</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cliente:</span>
                    <span className="font-medium">{customers.find(c => c.id === formData.customer_id)?.name || 'Não selecionado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Produtos:</span>
                    <span className="font-medium">{formData.products.length} item(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium">
                      {formData.start_date ? new Date(formData.start_date).toLocaleDateString('pt-BR') : '-'} 
                      a 
                      {formData.end_date_scheduled ? new Date(formData.end_date_scheduled).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  {(formData.discount || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Desconto:</span>
                      <span className="font-bold">-{formatPrice(formData.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-rose-600">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {(currentStep > 1 && !isEditing) || (currentStep === 3 && isEditing) && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-8 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
            >
              Voltar
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            {currentStep < 3 ? (
              <button
                type="button"
                disabled={currentStep === 1 ? !validateStep1() : !validateStep2()}
                onClick={handleNextStep}
                className={cn(
                  "px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all",
                  (currentStep === 1 ? validateStep1() : validateStep2())
                    ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                disabled={!validateStep1() || !validateStep2() || !validateStep3()}
                onClick={handleSubmit}
                className={cn(
                  "px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all",
                  (validateStep1() && validateStep2() && validateStep3())
                    ? "bg-green-600 text-white hover:bg-green-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                {isEditing ? 'Salvar Alterações' : 'Finalizar Aluguel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}