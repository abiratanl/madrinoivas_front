import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Rental } from '../../../services/rentalService';
import type { Customer } from '../../../types/customer';
import type { Product } from '../../../services/productService';
import type { Payment } from '../../../services/paymentService';
import { PAYMENT_METHOD_OPTIONS } from '../../../components/rentals/paymentOptions';

const PAYMENT_METHOD_LABELS: Record<string, string> = Object.fromEntries(
  PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label]),
);

// Lessor (Madri Noivas) legal identification, mirroring the backend contractService
const LESSOR_LEGAL_NAME = 'TERESA FRANCA DE OLIVEIRA FRANCISCO (ME)';
const LESSOR_TRADE_NAME = 'MADRI NOIVAS TRAJES A RIGOR';
const LESSOR_CNPJ = '07.846.246/0001-28';
const LESSOR_ADDRESS = 'Rua Dr. Castro Santos, nº 98, Centro, Guaratinguetá - SP, CEP 12505-010';
const LESSOR_REPRESENTATIVE = 'Teresa França de Oliveira Francisco';
const CONTRACT_CITY = 'Guaratinguetá';
const CONTRACT_STATE = 'SP';

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
    owner_name?: string | null;
    owner_signature_url?: string | null;
    digital_signature_base64?: string;
  };
  items: Array<{
    product: Product;
    quantity: number;
    unit_price: number;
  }>;
  payments?: Payment[];
  onPrint: () => void;
  onSign: () => void;
  onDownload: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Date-only values (rental start/end) must not be shifted by the UTC offset.
function parseDateValue(value: string) {
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
}

function formatDateLong(dateStr?: string | null) {
  if (!dateStr) return '-';
  return format(parseDateValue(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

function formatFittingDate(dateStr?: string | null) {
  if (!dateStr) return 'A definir';
  return format(new Date(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Pick the customer's default address (first as fallback)
function getCustomerAddress(customer?: Customer) {
  const addresses = customer?.addresses || [];
  return addresses.find((a) => a.is_default) || addresses[0] || null;
}

// Pick the customer's main phone-like contact (primary first)
function getCustomerPhone(customer?: Customer) {
  const contact = (customer?.contacts || [])
    .filter((c) => ['whatsapp', 'mobile', 'phone'].includes(c.type))
    .sort((a, b) => Number(b.is_primary || 0) - Number(a.is_primary || 0))[0];
  return contact?.value || customer?.main_phone || null;
}

// Pick the customer's main e-mail contact (primary first)
function getCustomerEmail(customer?: Customer) {
  const contact = (customer?.contacts || [])
    .filter((c) => c.type === 'email')
    .sort((a, b) => Number(b.is_primary || 0) - Number(a.is_primary || 0))[0];
  return contact?.value || customer?.email || null;
}

function getItemsDescription(items: ContractPreviewProps['items']) {
  const descriptions = items.map(({ product, quantity }) => {
    const details = [
      product.name,
      product.color ? `cor ${product.color}` : null,
      product.size ? `tamanho ${product.size}` : null,
      product.brand ? `marca ${product.brand}` : null,
    ].filter(Boolean);
    return `${details.join(', ')} (Qtd: ${quantity || 1})`;
  });
  return descriptions.length > 0 ? descriptions.join('; ') : '-';
}

export function ContractPreview({
  rental,
  customer,
  store,
  items,
  payments,
  onPrint,
  onSign,
  onDownload,
  onSendEmail,
  onSendWhatsApp,
}: ContractPreviewProps) {
  const confirmedPayments = (payments || [])
    .filter((payment) => payment.status !== 'cancelled')
    .slice()
    .sort((a, b) => new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime());
  const downPayment =
    confirmedPayments.find((payment) => payment.type === 'entry') ||
    confirmedPayments[0] ||
    null;
  const downPaymentAmount = downPayment
    ? parseFloat(String(downPayment.amount || 0))
    : Number(rental.deposit_paid || rental.sinal || 0);
  const downPaymentMethod = downPayment
    ? PAYMENT_METHOD_LABELS[downPayment.payment_method] || downPayment.payment_method
    : '-';

  const totalAmount = Number(rental.total_amount || rental.total_price || 0);
  const totalPaid =
    confirmedPayments.length > 0
      ? confirmedPayments.reduce(
        (sum, payment) => sum + parseFloat(String(payment.amount || 0)),
        0,
      )
      : downPaymentAmount;
  const remainingBalance = Math.max(totalAmount - totalPaid, 0);

  const customerAddress = getCustomerAddress(customer);
  const lesseeName = customer?.name || rental.customer_name || '-';
  const lesseeCpf = customer?.cpf || rental.customer_cpf || '-';
  const lesseeRg = customer?.rg || '-';
  const lesseePhone = getCustomerPhone(customer) || '-';
  const lesseeEmail = getCustomerEmail(customer) || '-';
  const itemsDescription = getItemsDescription(items);
  const storeCity = store.city || CONTRACT_CITY;
  const storeState = store.state || CONTRACT_STATE;
  const lessorCnpj = store.cnpj || LESSOR_CNPJ;
  const lessorAddress = store.address || LESSOR_ADDRESS;
  const lessorRepresentative = store.owner_name || LESSOR_REPRESENTATIVE;

  return (
    <div
      className="contract-preview max-w-3xl mx-auto bg-white p-8 md:p-12 pb-32 font-serif text-gray-900 leading-relaxed"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Título do Contrato */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline decoration-2 underline-offset-4 mb-2">
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LOCAÇÃO DE TRAJES A RIGOR
        </h2>
        <p className="text-sm text-gray-500">
          Contrato Nº: <strong>{rental.id?.slice(0, 8).toUpperCase()}</strong>
        </p>
      </div>

      <p className="text-sm mb-5">Pelo presente instrumento particular, de um lado:</p>

      {/* LOCADORA */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2">LOCADORA:</h3>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          <li><strong>Razão Social:</strong> {LESSOR_LEGAL_NAME}</li>
          <li><strong>Nome Fantasia:</strong> {LESSOR_TRADE_NAME}</li>
          <li><strong>CNPJ:</strong> {lessorCnpj}</li>
          <li><strong>Endereço:</strong> {lessorAddress}</li>
          <li><strong>Representante Legal:</strong> {lessorRepresentative}</li>
        </ul>
      </div>

      <p className="text-sm mb-5">E, de outro lado:</p>

      {/* LOCATÁRIO */}
      <div className="mb-6">
        <h3 className="font-bold text-base mb-2">LOCATÁRIO(A):</h3>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          <li><strong>Nome/Razão Social:</strong> {lesseeName}</li>
          <li><strong>CPF/CNPJ:</strong> {lesseeCpf}</li>
          <li><strong>RG:</strong> {lesseeRg}</li>
          <li>
            <strong>Endereço:</strong> {customerAddress?.street || '-'}, nº{' '}
            {customerAddress?.number || '-'} - {customerAddress?.neighborhood || '-'}
          </li>
          <li>
            <strong>Cidade/UF:</strong> {customerAddress?.city || '-'}/
            {customerAddress?.state || '-'} - CEP: {customerAddress?.zip_code || '-'}
          </li>
          <li><strong>Telefone/WhatsApp:</strong> {lesseePhone}</li>
          <li><strong>E-mail:</strong> {lesseeEmail}</li>
        </ul>
      </div>

      <p className="text-sm mb-6 text-justify">
        As partes acima qualificadas têm entre si, justo e contratado, o presente Contrato de
        Locação de Trajes a Rigor, mediante as cláusulas e condições a seguir descritas:
      </p>

      {/* Cláusula Primeira */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">Cláusula Primeira – Do Objeto</h3>
        <p className="text-sm text-justify mb-2">
          O presente contrato tem por objeto a locação do(s) traje(s) e acessório(s)
          discriminado(s) abaixo, para uso exclusivo do(a) LOCATÁRIO(A) na data estipulada neste
          instrumento:
        </p>
        <p className="text-sm text-justify ml-4">
          <strong>• Descrição dos Trajes / Itens:</strong> {itemsDescription}
        </p>
      </div>

      {/* Cláusula Segunda */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">
          Cláusula Segunda – Do Cronograma da Locação
        </h3>
        <p className="text-sm text-justify mb-2">
          A locação obedecerá rigorosamente às seguintes datas e prazos agendados:
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
          <li>
            <strong>Data da Retirada:</strong> {formatDateLong(rental.start_date)}
          </li>
          <li>
            <strong>Data/Hora Agendada para a Prova:</strong>{' '}
            {formatFittingDate(rental.fitting_date)}
          </li>
          <li>
            <strong>Data Prevista para Devolução:</strong>{' '}
            {formatDateLong(rental.end_date_scheduled)}
          </li>
        </ol>
        <p className="text-sm text-justify mt-2">
          <strong>Parágrafo Único:</strong> O(A) LOCATÁRIO(A) compromete-se a comparecer na data
          agendada para a prova, sob pena de inviabilizar os ajustes necessários no traje para a
          data do evento.
        </p>
      </div>

      {/* Cláusula Terceira */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">
          Cláusula Terceira – Do Preço e Condicionamento Financeiro
        </h3>
        <p className="text-sm text-justify mb-2">
          O valor total desta locação e o plano de pagamento pactuado estão definidos no seguinte
          resumo financeiro:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
          <li><strong>Valor Total do Aluguel:</strong> {formatCurrency(totalAmount)}</li>
          <li>
            <strong>Sinal / Entrada Recebido:</strong> {formatCurrency(downPaymentAmount)} (Forma
            de Pagamento: {downPaymentMethod})
          </li>
          <li><strong>Saldo Devedor Restante:</strong> {formatCurrency(remainingBalance)}</li>
        </ul>
        <p className="text-sm text-justify mt-2">
          <strong>Parágrafo Primeiro:</strong> O valor referente ao Sinal/Entrada tem caráter
          confirmatório da reserva. Em caso de desistência imotivada por parte do(a) LOCATÁRIO(A),
          o valor do sinal cobrirá os custos de reserva de agenda do traje e não será restituído.
        </p>
        <p className="text-sm text-justify mt-1">
          <strong>Parágrafo Segundo:</strong> O saldo devedor restante deverá ser integralmente
          quitado até a data de retirada do traje, sob pena de retenção do bem até a efetiva
          quitação.
        </p>
      </div>

      {/* Cláusula Quarta */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">Cláusula Quarta – Da Conservação e Danos</h3>
        <p className="text-sm text-justify">
          O(A) LOCATÁRIO(A) declara receber o(s) traje(s) em perfeitas condições de uso,
          higienizado(s) e sem defeitos aparentes, comprometendo-se a devolvê-lo(s) nas mesmas
          condições.
        </p>
        <p className="text-sm text-justify mt-2">
          <strong>Parágrafo Único:</strong> Danos irreparáveis, manchas definitivas (tintas,
          queimaduras de cigarro/vela), rasgos ou extravio total do traje obrigarão o(a)
          LOCATÁRIO(A) ao pagamento do valor comercial de venda do item, descontados os valores já
          pagos no aluguel.
        </p>
      </div>

      {/* Cláusula Quinta */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">Cláusula Quinta – Atraso na Devolução</h3>
        <p className="text-sm text-justify">
          A não devolução do traje na data limite estabelecida na Cláusula Segunda (
          {formatDateLong(rental.end_date_scheduled)}) sujeitará o(a) LOCATÁRIO(A) ao pagamento de
          multa diária correspondente a 10% (dez por cento) sobre o valor total do contrato por dia
          de atraso, sem prejuízo de perdas e danos caso o atraso comprometa a locação do mesmo
          traje para outro cliente.
        </p>
      </div>

      {/* Cláusula Sexta */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">
          Cláusula Sexta – Proteção e Tratamento de Dados (LGPD)
        </h3>
        <p className="text-sm text-justify mb-2">
          Em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 -
          LGPD):
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-justify">
          <li>
            A LOCADORA coleta e armazena os dados pessoais do(a) LOCATÁRIO(A) (Nome, CPF, RG,
            Endereço, Telefone e E-mail) exclusivamente para fins de execução deste contrato,
            emissão de comprovantes financeiros, identificação do(a) LOCATÁRIO(A) e contato
            operacional referente à prova e devolução dos trajes.
          </li>
          <li>
            A LOCADORA compromete-se a adotar medidas de segurança administrativas e tecnológicas
            para proteger os dados pessoais do(a) LOCATÁRIO(A) contra acessos não autorizados ou
            vazamentos.
          </li>
          <li>
            Os dados coletados não serão compartilhados com terceiros, exceto quando estritamente
            necessário para cumprimento de obrigação legal ou cobrança judicial/extrajudicial em
            caso de inadimplemento.
          </li>
        </ol>
      </div>

      {/* Cláusula Sétima */}
      <div className="mb-5">
        <h3 className="font-bold text-base mb-2 uppercase">
          Cláusula Sétima – Da Validade da Assinatura Eletrônica / Digitalizada
        </h3>
        <p className="text-sm text-justify">
          As partes expressamente concordam e reconhecem a validade, integridade e eficácia
          jurídica deste instrumento assinado por meio eletrônico, digitalizado ou mediante
          aplicação de imagem da assinatura do representante legal da LOCADORA, nos termos do art.
          10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, reconhecendo-o
          como título executivo extrajudicial bastante para todos os fins de direito.
        </p>
      </div>

      {/* Cláusula Oitava */}
      <div className="mb-8">
        <h3 className="font-bold text-base mb-2 uppercase">Cláusula Oitava – Do Foro</h3>
        <p className="text-sm text-justify">
          Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o
          Foro da Comarca de {storeCity} - {storeState}, com renúncia expressa a qualquer outro, por
          mais privilegiado que seja.
        </p>
      </div>

      <p className="text-sm text-justify mb-3">
        E, por estarem assim justos e contratados, assinam o presente instrumento para que produza
        seus jurídicos e legais efeitos.
      </p>

      <div className="text-center text-sm mb-10">
        <p>{storeCity} - {storeState}, {formatDateLong(new Date().toISOString())}.</p>
      </div>

      {/* Assinaturas */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
        {/* Locadora */}
        <div className="text-center">
          {store.owner_signature_url ? (
            <img
              src={store.owner_signature_url}
              alt="Assinatura Locadora"
              className="mx-auto max-h-20 object-contain"
            />
          ) : (
            store.digital_signature_base64 && (
              <img
                src={`data:image/png;base64,${store.digital_signature_base64}`}
                alt="Assinatura Locadora"
                className="mx-auto max-h-20"
              />
            )
          )}
          <div className="border-t border-gray-400 pt-3 mt-2">
            <p className="font-bold uppercase tracking-wider">{LESSOR_LEGAL_NAME}</p>
            <p className="text-sm mt-1">{LESSOR_TRADE_NAME}</p>
            <p className="text-xs text-gray-500 mt-1">CNPJ: {lessorCnpj}</p>
            <p className="text-xs text-gray-500 mt-1">
              Representante Legal: {lessorRepresentative}
            </p>
          </div>
        </div>

        {/* Locatário */}
        <div className="text-center">
          <div id="signature-pad" className="min-h-[80px]" />
          <div className="border-t border-gray-400 pt-3 mt-2">
            <p className="font-bold uppercase tracking-wider">{lesseeName}</p>
            <p className="text-xs text-gray-500 mt-1">CPF: {lesseeCpf}</p>
            <p className="text-sm mt-1 font-bold">LOCATÁRIO</p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex flex-wrap justify-center gap-3 shadow-lg"
        style={{ zIndex: 50 }}
      >
        <button
          onClick={onPrint}
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          🖨 Imprimir
        </button>
        <button
          onClick={onSign}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
        >
          ✍ Assinar Digitalmente
        </button>
        <button
          onClick={onDownload}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
        >
          ⬇ Gerar PDF
        </button>
        <button
          onClick={onSendEmail}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm flex items-center gap-2"
        >
          📧 Enviar Email
        </button>
        <button
          onClick={onSendWhatsApp}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm flex items-center gap-2"
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
