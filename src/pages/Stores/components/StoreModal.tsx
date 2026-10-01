import React, { useState } from 'react';
import { X, Check, Phone, MapPin, Plus, Trash } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { maskPhone, maskCEP } from '../../../utils/masks';
import { BRAZILIAN_STATES } from '../../../constants/brazilianStates';
import type { StoreAddress } from '../../../services/storeService';

interface StoreFormData {
  id: string; 
  name: string;
  phone: string;
  is_active: boolean;
  addresses: StoreAddress[];
}

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: StoreFormData;
  setFormData: (data: StoreFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
}

export function StoreModal({
  isOpen, onClose, isEditing, formData, setFormData,
  handleSubmit
}: StoreModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        const newAddrs = [...(formData.addresses || [])];
        newAddrs[0] = {
          ...newAddrs[0],
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        };
        setFormData({ ...formData, addresses: newAddrs });
      }
    } catch (error) { console.error("Erro CEP:", error); }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const isStep1Valid = () => {
    return (formData.name?.trim()?.length ?? 0) >= 3;
  };

  const isStep2Valid = () => {
    const addr = formData.addresses?.[0];
    const hasAddress = addr?.zip_code && addr?.street && addr?.number && addr?.city && addr?.state;
    return hasAddress;
  };

  const handleFinalAction = async (e: React.FormEvent) => {
    const isOk = await handleSubmit(e);

    if (isOk) {
      onClose();
      setCurrentStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* HEADER E PROGRESSO */}
        <div className="bg-rose-600 p-6 text-white">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">{isEditing ? 'Editar Loja' : 'Nova Loja'}</h3>
            <button onClick={handleClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex items-center justify-between relative px-4 text-white">
            {[1, 2].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                  currentStep >= step ? "bg-white text-rose-600 border-white" : "bg-rose-400 text-rose-100 border-rose-400"
                )}>
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">
                  {step === 1 ? 'Dados' : 'Endereço'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-rose-400 -z-0" />
          </div>
        </div>

        {/* FORMULÁRIO COM SCROLL */}
        <form id="store-form" onSubmit={handleFinalAction} onKeyDown={(e) => {
          if (e.key === 'Enter' && currentStep < 2) {
            e.preventDefault();
            if (currentStep === 1 ? isStep1Valid() : isStep2Valid()) {
              setCurrentStep(prev => prev + 1);
            }
          }
        }} className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nome da Loja</label>
                <input required type="text" className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Madri Noivas - Centro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Telefone</label>
                  <input type="tel" className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} placeholder="(00) 0000-0000" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* SEÇÃO DE ENDEREÇO */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" /> Endereço da Loja
                  </h4>
                  <select
                    className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer outline-none",
                      "bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-400 focus:ring-2 focus:ring-rose-500/20"
                    )}
                    value={formData.addresses?.[0]?.type || 'commercial'}
                    onChange={e => {
                      const newA = [...(formData.addresses || [])];
                      newA[0] = { ...newA[0], type: e.target.value as any };
                      setFormData({ ...formData, addresses: newA });
                    }}
                  >
                    <option value="commercial">🏢 Comercial</option>
                    <option value="residential">🏠 Residencial</option>
                  </select>
                </div>

                {/* Linha 1: CEP e Logradouro */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">CEP</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                      placeholder="00000-000"
                      value={formData.addresses?.[0]?.zip_code || ''}
                      onBlur={e => handleCepBlur(e.target.value)}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], zip_code: maskCEP(e.target.value) };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Rua / Logradouro</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      value={formData.addresses?.[0]?.street || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], street: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                </div>

                {/* Linha 2: Número e Bairro */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nº</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      value={formData.addresses?.[0]?.number || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], number: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Bairro</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      value={formData.addresses?.[0]?.neighborhood || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], neighborhood: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                </div>

                {/* Linha 3: Cidade, Complemento e UF */}
                <div className="grid grid-cols-6 gap-3">
                  <div className="col-span-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cidade</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      value={formData.addresses?.[0]?.city || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], city: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Compl.</label>
                    <input
                      type="text"
                      placeholder="Apto/Sala"
                      className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none"
                      value={formData.addresses?.[0]?.complement || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], complement: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">UF</label>
                    <select
                      className="w-full mt-1 px-2 py-2 rounded-lg border border-gray-200 outline-none bg-gray-50 font-bold text-rose-700"
                      value={formData.addresses?.[0]?.state || ''}
                      onChange={e => {
                        const newA = [...(formData.addresses || [])];
                        newA[0] = { ...newA[0], state: e.target.value };
                        setFormData({ ...formData, addresses: newA });
                      }}
                    >
                      <option value="">--</option>
                      {BRAZILIAN_STATES.map(state => (
                        <option key={state.id} value={state.id}>{state.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {currentStep < 2 ? (
            <button
              type="button"
              disabled={currentStep === 1 ? !isStep1Valid() : !isStep2Valid()}
              className={cn(
                "px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all",
                (currentStep === 1 ? isStep1Valid() : isStep2Valid())
                  ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentStep(prev => prev + 1);
              }}
            >
              Continuar
            </button>
          ) : (
            <button
              type="submit"
              form="store-form"
              className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
            >
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Loja'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}