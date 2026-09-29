import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Rental } from '../../../services/rentalService';
import type { Customer } from '../../../types/customer';
import type { Product } from '../../../services/productService';

interface ContractPreviewProps {
  rental: Rental;
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
  onPrint: () => void;
  onSign: () => void;
  onDownload: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string) {
  return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function getItemDescription(item: ContractPreviewProps['items'][0]) {
  const { product } = item;
  const parts = [];
  if (product.name) parts.push(product.name);
  if (product.color) parts.push(product.color);
  if (product.size) parts.push(`tamanho ${product.size}`);
  if (product.brand) parts.push(product.brand);
  return parts.join(', ');
}

export function ContractPreview({
  rental,
  customer,
  store,
  items,
  onPrint,
  onSign,
  onDownload,
  onSendEmail,
  onSendWhatsApp,
}: ContractPreviewProps) {
  const depositPaid = rental.deposit_paid || rental.sinal || 0;
  const balanceDue = (rental.total_price || 0) - depositPaid;
  const extraDailyRate = rental.extra_daily_rate || rental.daily_rate || 0;
  const today = new Date();

  return (
    <div className="contract-preview max-w-3xl mx-auto bg-white p-8 md:p-12 font-serif text-gray-900 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header - Loja */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">{store.name}</h1>
        <p className="text-sm text-gray-600">{store.address} - {store.city}/{store.state}</p>
        <p className="text-sm text-gray-600">CNPJ: {store.cnpj} | Tel: {store.phone} | {store.email}</p>
      </div>

      {/* Título do Contrato */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline decoration-2 underline-offset-4 mb-2">CONTRATO DE LOCAÇÃO DE VESTUÁRIO E ACESSÓRIOS</h2>
        <p className="text-sm text-gray-500">Contrato Nº: <strong>{rental.id?.slice(0, 8).toUpperCase()}</strong></p>
      </div>

      {/* Cláusula 1 - Objeto */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Cláusula 1ª – Do Objeto</h3>
        <p className="mb-3">O presente contrato tem como objeto a locação da(s) seguinte(s) peça(s) de vestuário/acessório(s):</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm">
              <strong>Descrição da peça:</strong> {getItemDescription(item)} (Cor: {item.product.color || 'Não informada'}, Marca: {item.product.brand || 'Não informada'}, Modelo: {item.product.model || 'Não informado'}, Tamanho: {item.product.size || 'Não informado'})
              <br />
              <strong>Acessórios inclusos:</strong> {item.product.accessories || 'Nenhum'}
              <br />
              <strong>Valor diário:</strong> {formatCurrency(item.unit_price)} | <strong>Valor de venda (extravio):</strong> {formatCurrency(item.product.sale_price || item.unit_price * 10)}
            </li>
          ))}
        </ul>
      </div>

      {/* Cláusula 2 - Prazo */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Cláusula 2ª – Do Prazo da Locação</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li><strong>Data de Retirada/Entrega:</strong> {formatDate(rental.start_date)}</li>
          <li><strong>Data de Devolução:</strong> {formatDate(rental.end_date_scheduled)}</li>
          <li>O prazo de locação é certo e determinado, encerrando-se obrigatoriamente na data de devolução estipulada acima.</li>
        </ul>
      </div>

      {/* Cláusula 3 - Valor */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Cláusula 3ª – Do Valor e Forma de Pagamento</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li><strong>Valor Total do Aluguel:</strong> {formatCurrency(rental.total_price || 0)}</li>
          <li><strong>Sinal de Reserva (não reembolsável em caso de desistência):</strong> {formatCurrency(depositPaid)}</li>
          <li><strong>Restante do pagamento:</strong> {formatCurrency(balanceDue)} — Deverá ser quitado no ato da retirada da peça.</li>
        </ul>
      </div>

      {/* Cláusula 4 - Obrigações */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Cláusula 4ª – Das Obrigações da Locatária(O)</h3>
        <ol className="list-decimal list-inside space-y-2 ml-4 text-sm">
          <li>Utilizar a peça com cautela, evitando danos, manchas severas, rasgos ou alterações (como barras ou ajustes não autorizados).</li>
          <li>Não lavar ou passar a peça, devendo devolvê-la nas mesmas condições em que foi recebida.</li>
          <li>Devolver o produto no prazo estabelecido na Cláusula 2ª.</li>
        </ol>
      </div>

      {/* Cláusula 5 - Atrasos, Danos e Extravio */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-3">Cláusula 5ª – Atrasos, Danos e Extravio</h3>
        <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
          <li><strong>Atraso na Devolução:</strong> Será cobrada uma taxa de diária adicional no valor de {formatCurrency(extraDailyRate)} por dia de atraso.</li>
          <li><strong>Danos à Peça:</strong> Se houverem danos reparáveis (manchas profundas ou rasgos), a Locatária(O) arcará com o custo do conserto/lavagem especializada. Caso o dano seja irreparável ou ocorra extravio/roubo, será cobrado o valor integral de venda da peça descrito pela Locadora.</li>
        </ul>
      </div>

      {/* Cláusula 6 - Foro */}
      <div className="mb-10">
        <h3 className="font-bold text-lg mb-3">Cláusula 6ª – Do Foro</h3>
        <p className="text-sm">Fica eleito o foro da Comarca de <strong>{store.city} - {store.state}</strong> para dirimir quaisquer dúvidas decorrentes deste contrato.</p>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        {/* Locadora */}
        <div className="text-center">
          <div className="border-t border-gray-400 pt-4">
            <p className="font-bold uppercase tracking-wider">LOCADORA</p>
            <p className="text-sm mt-2">{store.name}</p>
            {store.digital_signature_base64 && (
              <img src={`data:image/png;base64,${store.digital_signature_base64}`} alt="Assinatura Locadora" className="mx-auto mt-4 max-h-20" />
            )}
          </div>
        </div>

        {/* Locatária */}
        <div className="text-center">
          <div className="border-t border-gray-400 pt-4">
            <p className="font-bold uppercase tracking-wider">LOCATÁRIA(O)</p>
            <p className="text-sm mt-2">{customer?.name || '________________________________________'}</p>
            <p className="text-xs text-gray-500 mt-1">CPF: {customer?.cpf || '________________'}</p>
            <div id="signature-pad" className="mt-4 min-h-[100px] border-b border-gray-400 mx-auto max-w-xs" />
          </div>
        </div>
      </div>

      {/* Data e Local */}
      <div className="text-center mt-10 text-sm">
        <p>{store.city} - {store.state}, {format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.</p>
      </div>

      {/* Ações */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-wrap justify-center gap-3 shadow-lg" style={{ zIndex: 50 }}>
        <button onClick={onPrint} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm flex items-center gap-2">
          🖨 Imprimir
        </button>
        <button onClick={onSign} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm flex items-center gap-2">
          ✍ Assinar Digitalmente
        </button>
        <button onClick={onDownload} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2">
          ⬇ Baixar PDF
        </button>
        <button onClick={onSendEmail} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-2">
          📧 Enviar Email
        </button>
        <button onClick={onSendWhatsApp} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm flex items-center gap-2">
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}