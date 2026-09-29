import React, { useState, useCallback, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ContractPreview } from './ContractPreview';
import { SignaturePad } from './SignaturePad';
import type { Rental } from '../../../services/rentalService';
import type { Customer } from '../../../types/customer';
import type { Product } from '../../../services/productService';
import { toast } from 'react-hot-toast';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
  customer: Customer | undefined;
  store: {
    name: string;
    address: string;
    city: string;
    state: string;
    cnpj: string;
    phone: string;
    email: string;
    digital_signature_base64?: string;
  };
  items: Array<{
    product: Product;
    quantity: number;
    unit_price: number;
  }>;
  onGenerateContract: (rentalId: string, signatureBase64: string) => Promise<{ pdfUrl: string; contractId: string }>;
  onSendEmail: (contractId: string, email: string) => Promise<void>;
  onSendWhatsApp: (contractId: string, phone: string) => Promise<void>;
}

type ModalStep = 'preview' | 'signature' | 'processing' | 'done';

export function ContractModal({
  isOpen,
  onClose,
  rental,
  customer,
  store,
  items,
  onGenerateContract,
  onSendEmail,
  onSendWhatsApp,
}: ContractModalProps) {
  const [step, setStep] = useState<ModalStep>('preview');
  const [signatureBase64, setSignatureBase64] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSign = useCallback(() => {
    setStep('signature');
  }, []);

  const handleSignatureComplete = useCallback((base64: string) => {
    setSignatureBase64(base64);
  }, []);

  const handleClearSignature = useCallback(() => {
    setSignatureBase64(null);
  }, []);

  const handleGenerateAndSign = useCallback(async () => {
    if (!rental || !signatureBase64) {
      toast.error('Assinatura necessária');
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      const result = await onGenerateContract(rental.id, signatureBase64);
      setContractId(result.contractId);
      setPdfUrl(result.pdfUrl);
      setStep('done');
      toast.success('Contrato gerado e assinado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao gerar contrato');
      setStep('signature');
    } finally {
      setLoading(false);
    }
  }, [rental, signatureBase64, onGenerateContract]);

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `contrato-${rental?.id?.slice(0, 8)}.pdf`;
      link.click();
    }
  }, [pdfUrl, rental]);

  const handleSendEmail = useCallback(async () => {
    if (!contractId || !customer?.email) {
      toast.error('Email do cliente não disponível');
      return;
    }
    setLoading(true);
    try {
      await onSendEmail(contractId, customer.email);
      toast.success('Contrato enviado por email!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  }, [contractId, customer?.email, onSendEmail]);

  const handleSendWhatsApp = useCallback(async () => {
    if (!contractId || !customer?.main_phone) {
      toast.error('Telefone do cliente não disponível');
      return;
    }
    setLoading(true);
    try {
      await onSendWhatsApp(contractId, customer.main_phone);
      toast.success('Contrato enviado por WhatsApp!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao enviar WhatsApp');
    } finally {
      setLoading(false);
    }
  }, [contractId, customer?.main_phone, onSendWhatsApp]);

  const handleBackToPreview = useCallback(() => {
    setStep('preview');
  }, []);

  const handleNewContract = useCallback(() => {
    setStep('preview');
    setSignatureBase64(null);
    setContractId(null);
    setPdfUrl(null);
  }, []);

  if (!isOpen || !rental) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg">
            {step === 'preview' && 'Preview do Contrato'}
            {step === 'signature' && 'Assinatura Digital'}
            {step === 'processing' && 'Gerando Contrato...'}
            {step === 'done' && 'Contrato Finalizado'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {step === 'preview' && (
            <ContractPreview
              rental={rental}
              customer={customer}
              store={store}
              items={items}
              onPrint={handlePrint}
              onSign={handleSign}
              onDownload={handleDownload}
              onSendEmail={handleSendEmail}
              onSendWhatsApp={handleSendWhatsApp}
            />
          )}

          {step === 'signature' && (
            <div className="p-6 space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  ✍ Assinatura da Locatária(o)
                </h4>
                <p className="text-sm text-purple-700">
                  {customer?.name || 'Cliente'} - CPF: {customer?.cpf || 'Não informado'}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Ao assinar, você concorda com todos os termos do contrato acima.
                </p>
              </div>

              <SignaturePad
                onSignatureComplete={handleSignatureComplete}
                onClear={handleClearSignature}
                height={250}
              />

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  onClick={handleBackToPreview}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleGenerateAndSign}
                  disabled={!signatureBase64 || loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✍ Finalizar e Assinar'}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Gerando PDF assinado...</p>
            </div>
          )}

          {step === 'done' && (
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Contrato Assinado com Sucesso!</h3>
              <p className="text-gray-600">O contrato foi gerado, assinado e salvo no sistema.</p>
              
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <button onClick={handleDownload} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                  ⬇ Baixar PDF
                </button>
                {customer?.email && (
                  <button onClick={handleSendEmail} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2">
                    📧 Enviar Email
                  </button>
                )}
                {customer?.main_phone && (
                  <button onClick={handleSendWhatsApp} disabled={loading} className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 flex items-center gap-2">
                    💬 WhatsApp
                  </button>
                )}
                <button onClick={handleNewContract} className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                  Novo Contrato
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}