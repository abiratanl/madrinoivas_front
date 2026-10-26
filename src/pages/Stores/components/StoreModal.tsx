import React, { useState } from 'react';
import {
  X,
  Check,
  Phone,
  MapPin,
  Plus,
  Trash,
  Upload,
  FileSignature,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../../utils/cn';
import { maskPhone, maskCEP, maskCPF, maskCNPJ } from '../../../utils/masks';
import { BRAZILIAN_STATES } from '../../../constants/brazilianStates';
import {
  resolveStoreSignatureUrl,
  type StoreAddress,
  type StoreContact,
  type StoreContactType,
} from '../../../services/storeService';

interface StoreFormData {
  id: string; 
  name: string;
  cnpj: string;
  owner_name: string;
  owner_cpf: string;
  owner_signature: string | null;
  ownerSignatureFile: File | null;
  removeOwnerSignature: boolean;
  is_active: boolean;
  addresses: StoreAddress[];
  contacts: StoreContact[];
}

const CONTACT_TYPE_OPTIONS: Array<{ value: StoreContactType; label: string }> = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'mobile', label: 'Celular' },
  { value: 'landline', label: 'Telefone Fixo' },
  { value: 'email', label: 'E-mail' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

const PHONE_LIKE_TYPES: StoreContactType[] = ['whatsapp', 'mobile', 'landline'];

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: StoreFormData;
  setFormData: (data: StoreFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
  submitting: boolean;
}

export function StoreModal({
  isOpen, onClose, isEditing, formData, setFormData,
  handleSubmit, submitting
}: StoreModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const signatureInputRef = React.useRef<HTMLInputElement>(null);

  const newSignaturePreview = React.useMemo(
    () => (formData.ownerSignatureFile ? URL.createObjectURL(formData.ownerSignatureFile) : null),
    [formData.ownerSignatureFile],
  );

  React.useEffect(() => {
    return () => {
      if (newSignaturePreview) URL.revokeObjectURL(newSignaturePreview);
    };
  }, [newSignaturePreview]);

  const existingSignatureUrl = React.useMemo(
    () => resolveStoreSignatureUrl(formData.owner_signature),
    [formData.owner_signature],
  );

  const signaturePreview = newSignaturePreview || existingSignatureUrl;

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

  const updateContact = (index: number, changes: Partial<StoreContact>) => {
    const newContacts = [...(formData.contacts || [])];
    newContacts[index] = { ...newContacts[index], ...changes };
    setFormData({ ...formData, contacts: newContacts });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...(formData.contacts || []), { type: 'whatsapp', value: '', is_primary: false }],
    });
  };

  const removeContact = (index: number) => {
    const newContacts = (formData.contacts || []).filter((_, i) => i !== index);
    setFormData({ ...formData, contacts: newContacts });
  };

  const setPrimaryContact = (index: number) => {
    const newContacts = (formData.contacts || []).map((contact, i) => ({
      ...contact,
      is_primary: i === index,
    }));
    setFormData({ ...formData, contacts: newContacts });
  };

  const isStep1Valid = () => {
    const nameIsValid = (formData.name?.trim()?.length ?? 0) >= 3;
    const cnpjDigits = (formData.cnpj || '').replace(/\D/g, '');
    const cpfDigits = (formData.owner_cpf || '').replace(/\D/g, '');
    const cnpjIsValid = cnpjDigits.length === 0 || cnpjDigits.length === 14;
    const cpfIsValid = cpfDigits.length === 0 || cpfDigits.length === 11;

    return nameIsValid && cnpjIsValid && cpfIsValid;
  };

  const isStep2Valid = () => {
    const addr = formData.addresses?.[0];
    const hasAddress = addr?.zip_code && addr?.street && addr?.number && addr?.city && addr?.state;
    return hasAddress;
  };

  const isStep3Valid = () => true;

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    return isStep3Valid();
  };

  const handleSignatureFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Envie um arquivo de imagem para a assinatura.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A assinatura deve ter no máximo 5MB.');
      return;
    }

    setFormData({
      ...formData,
      ownerSignatureFile: file,
      removeOwnerSignature: false,
    });
  };

  const discardNewSignature = () => {
    setFormData({ ...formData, ownerSignatureFile: null });
  };

  const removeExistingSignature = () => {
    setFormData({
      ...formData,
      owner_signature: null,
      ownerSignatureFile: null,
      removeOwnerSignature: true,
    });
  };

  const handleFinalAction = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    // The form must only be saved on the last step. Any earlier submit event
    // (e.g. pressing Enter while filling the address) just advances the wizard.
    if (currentStep < 3) {
      goToNextStep();
      return;
    }

    const isOk = await handleSubmit(e as React.FormEvent);

    if (isOk) {
      onClose();
      setCurrentStep(1);
    }
  };

  const goToNextStep = () => {
    if (!isCurrentStepValid()) return;
    setCurrentStep((step) => Math.min(step + 1, 3));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
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
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all",
                  currentStep >= step ? "bg-white text-rose-600 border-white" : "bg-rose-400 text-rose-100 border-rose-400"
                )}>
                  {currentStep > step ? <Check className="w-6 h-6" /> : step}
                </div>
                <span className="text-[10px] mt-2 font-bold uppercase tracking-wider">
                  {step === 1 ? 'Dados' : step === 2 ? 'Endereço' : 'Assinatura'}
                </span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-rose-400 -z-0" />
          </div>
        </div>

        {/* FORMULÁRIO COM SCROLL */}
        <form id="store-form" onSubmit={(e) => {
          e.preventDefault();
          if (currentStep < 3) {
            goToNextStep();
          } else {
            void handleFinalAction(e);
          }
        }} onKeyDown={(e) => {
          if (e.key === 'Enter' && currentStep < 3) {
            e.preventDefault();
            e.stopPropagation();
            goToNextStep();
          }
        }} className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Nome da Loja</label>
                  <input required type="text" className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Madri Noivas - Centro" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.cnpj || ''}
                    onChange={e => setFormData({ ...formData, cnpj: maskCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nome do Proprietário</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.owner_name || ''}
                    onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="Nome completo do responsável legal"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">CPF do Proprietário</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                    value={formData.owner_cpf || ''}
                    onChange={e => setFormData({ ...formData, owner_cpf: maskCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              {/* SEÇÃO DE CONTATOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-rose-500" /> Contatos
                  </h4>
                  <button
                    type="button"
                    onClick={addContact}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border-2 bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-400 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                {(formData.contacts || []).map((contact, index) => (
                  <div key={index} className="flex items-end gap-2">
                    <div className="w-32">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo</label>
                      <select
                        className="w-full mt-1 px-2 py-2 rounded-lg border border-gray-200 outline-none bg-gray-50"
                        value={contact.type}
                        onChange={e => updateContact(index, { type: e.target.value as StoreContactType })}
                      >
                        {CONTACT_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Contato</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-rose-500"
                        value={contact.value || ''}
                        onChange={e => updateContact(index, {
                          value: PHONE_LIKE_TYPES.includes(contact.type) ? maskPhone(e.target.value) : e.target.value,
                        })}
                        placeholder={PHONE_LIKE_TYPES.includes(contact.type) ? '(00) 0000-0000' : 'Informe o contato'}
                      />
                    </div>
                    <label className="flex items-center gap-1.5 pb-2 text-[10px] font-bold text-gray-400 uppercase cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="primary-contact"
                        className="accent-rose-600"
                        checked={!!contact.is_primary}
                        onChange={() => setPrimaryContact(index)}
                      />
                      Principal
                    </label>
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      title="Remover contato"
                      className="p-2 mb-0.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
                      newA[0] = { ...newA[0], type: e.target.value as StoreAddress['type'] };
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

          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-rose-500" /> Assinatura do Proprietário
                </h4>
              </div>

              <p className="text-sm text-gray-600">
                Envie uma imagem da assinatura do responsável legal da loja. Ela será usada nos
                contratos de aluguel.
              </p>

              <input
                ref={signatureInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleSignatureFile}
                className="hidden"
              />

              {signaturePreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl border border-gray-200 bg-white p-6">
                    <span
                      className={cn(
                        "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        newSignaturePreview
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {newSignaturePreview ? 'Nova assinatura' : 'Assinatura atual'}
                    </span>
                    <img
                      src={signaturePreview}
                      alt="Assinatura do proprietário"
                      className="mx-auto max-h-40 object-contain"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition-all hover:border-rose-400"
                    >
                      <Upload className="w-4 h-4" />
                      {newSignaturePreview ? 'Escolher outra' : 'Substituir assinatura'}
                    </button>
                    <button
                      type="button"
                      onClick={newSignaturePreview ? discardNewSignature : removeExistingSignature}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash className="w-4 h-4" />
                      {newSignaturePreview ? 'Descartar nova' : 'Remover assinatura'}
                    </button>
                  </div>

                  {newSignaturePreview && existingSignatureUrl && (
                    <p className="text-xs text-gray-400">
                      A nova assinatura substituirá a atual ao salvar.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-rose-500 hover:bg-rose-50"
                >
                  <Upload className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                  <span className="mb-1 block font-medium text-gray-500">
                    Selecionar arquivo
                  </span>
                  <span className="text-xs text-gray-400">PNG, JPG ou WEBP até 5MB</span>
                </button>
              )}

              <p className="text-xs text-gray-400">
                A imagem será enviada para o Cloudflare R2; apenas o caminho do arquivo será salvo
                no banco de dados.
              </p>
            </div>
          )}
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
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
                disabled={!isCurrentStepValid()}
                className={cn(
                  "px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2",
                  isCurrentStepValid()
                    ? "bg-rose-600 text-white hover:bg-rose-700 active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNextStep();
                }}
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalAction}
                disabled={submitting}
                className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Loja')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}