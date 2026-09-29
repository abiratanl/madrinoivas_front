import { useCallback } from 'react';
import { rentalService } from '../../../services/rentalService';
import { toast } from 'react-hot-toast';

export function useContract() {
  // Gera contrato no backend
  const generateContract = useCallback(async (rentalId: string, signatureBase64: string) => {
    const response = await rentalService.generateContract(rentalId, {
      lessee_signature: signatureBase64,
    });
    return {
      contractId: response.data?.id || response.id,
      pdfUrl: response.data?.pdf_url || response.pdf_url,
    };
  }, []);

  // Envia contrato por email
  const sendContractEmail = useCallback(async (contractId: string, email: string) => {
    await rentalService.sendContractEmail(contractId, { email });
  }, []);

  // Envia contrato por WhatsApp
  const sendContractWhatsApp = useCallback(async (contractId: string, phone: string) => {
    await rentalService.sendContractWhatsApp(contractId, { phone });
  }, []);

  // Download direto do PDF (fallback se backend não tiver endpoint)
  const downloadContractPdf = useCallback(async (rentalId: string) => {
    try {
      const response = await rentalService.getContractPdf(rentalId);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrato-${rentalId.slice(0, 8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Erro ao baixar PDF');
      throw err;
    }
  }, []);

  return {
    generateContract,
    sendContractEmail,
    sendContractWhatsApp,
    downloadContractPdf,
  };
}

// Extend rentalService with contract methods
declare module '../../../services/rentalService' {
  interface RentalService {
    generateContract: (id: string, data: { lessee_signature: string }) => Promise<any>;
    sendContractEmail: (id: string, data: { email: string }) => Promise<any>;
    sendContractWhatsApp: (id: string, data: { phone: string }) => Promise<any>;
    getContractPdf: (id: string) => Promise<Blob>;
  }
}