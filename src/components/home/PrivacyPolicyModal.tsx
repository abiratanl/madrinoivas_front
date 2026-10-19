import { useEffect, useRef } from 'react';
import { X, Shield } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 rounded-t-2l">
          <h2 id="privacy-policy-title" className="flex items-center gap-2 text-2xl font-semibold text-gray-900 font-serif">
            <Shield className="w-6 h-6 text-madriGold" />
            Política de Privacidade e Proteção de Dados
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar política de privacidade"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            Seja bem-vindo(a) à nossa plataforma. A privacidade e a segurança dos seus dados pessoais são prioridades absolutas para nós. Esta Política de Privacidade explica, de forma clara e transparente, como coletamos, usamos, armazenamos e protegemos os seus dados ao utilizar o nosso site e os nossos serviços de aluguel de roupas.
          </p>
          <p className="text-gray-600 mb-6 font-medium">
            Ao utilizar nossa plataforma, você declara estar ciente dos termos aqui descritos.
          </p>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. QUEM É O CONTROLADOR DOS SEUS DADOS?</h3>
            <p className="text-gray-600 mb-2">
              A empresa responsável pelo tratamento dos seus dados pessoais (Controladora) é:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li><strong>Razão Social:</strong> Tech Siblings Soluções</li>
              <li><strong>CNPJ:</strong> [00.000.000/0000-00]</li>
              <li><strong>Endereço:</strong> Rua Maria do Carmo Guimarães de Castro, 122 Residencial Nino - Guaratinguetá-SP</li>
              <li><strong>E-mail de Contato:</strong> faleconosco@madrinoivas.com.br</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. QUAIS DADOS PESSOAIS COLETAMOS E PARA QUÊ?</h3>
            <p className="text-gray-600 mb-4">
              Coletamos apenas os dados estritamente necessários para prestar um serviço de excelência. Eles estão divididos em três categorias principais:
            </p>
            
            <div className="space-y-4 ml-4">
              <div className="border-l-2 border-madriGold pl-4">
                <h4 className="font-semibold text-gray-900">Dados de Cadastro</h4>
                <p className="text-gray-600">Nome completo, CPF, RG, data de nascimento e gênero.</p>
                <p className="text-gray-600"><strong>Finalidade:</strong> Identificar você, criar sua conta no site, emitir notas fiscais e gerar o contrato de aluguel.</p>
              </div>

              <div className="border-l-2 border-madriGold pl-4">
                <h4 className="font-semibold text-gray-900">Dados de Contato e Entrega</h4>
                <p className="text-gray-600">Endereço residencial completo, e-mail e número de telefone/WhatsApp.</p>
                <p className="text-gray-600"><strong>Finalidade:</strong> Enviar as roupas alugadas, recolher as peças na devolução, enviar confirmações do pedido (status do aluguel) e responder a dúvidas no suporte.</p>
              </div>

              <div className="border-l-2 border-madriGold pl-4">
                <h4 className="font-semibold text-gray-900">Dados Financeiros e de Pagamento</h4>
                <p className="text-gray-600">Dados de cartão de crédito (criptografados) e histórico de pagamentos.</p>
                <p className="text-gray-600"><strong>Finalidade:</strong> Processar o pagamento do aluguel e gerenciar a cobrança de eventuais taxas de atraso ou danos às peças, conforme previsto em contrato.</p>
              </div>

              <div className="border-l-2 border-madriGold pl-4">
                <h4 className="font-semibold text-gray-900">Dados de Navegação (Cookies)</h4>
                <p className="text-gray-600">Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência no site.</p>
                <p className="text-gray-600"><strong>Finalidade:</strong> Melhorar a experiência de uso do site, corrigir erros técnicos e prevenir fraudes.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. QUAL É A BASE LEGAL PARA O TRATAMENTO?</h3>
            <p className="text-gray-600 mb-4">
              A LGPD exige que todo tratamento de dados tenha uma justificativa legal. Nós tratamos seus dados com base em:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Execução de Contrato:</strong> Para cumprir as obrigações do aluguel das roupas que você solicitou.</li>
              <li><strong>Cumprimento de Obrigação Legal:</strong> Para emitir notas fiscais e armazenar registros de acesso ao site (exigência do Marco Civil da Internet).</li>
              <li><strong>Legítimo Interesse:</strong> Para melhorias na nossa plataforma e segurança contra fraudes.</li>
              <li><strong>Consentimento:</strong> Para o envio de e-mails de marketing e promoções (o qual você pode revogar a qualquer momento).</li>
            </ol>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4. COM QUEM COMPARTILHAMOS OS SEUS DADOS?</h3>
            <p className="text-gray-600 mb-4">
              Não vendemos nem alugamos seus dados pessoais para terceiros. O compartilhamento ocorre estritamente para viabilizar o serviço de aluguel, com os seguintes parceiros:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li><strong>Intermediadores de Pagamento:</strong> Para processar as transações financeiras de forma segura.</li>
              <li><strong>Empresas de Logística e Motoboys:</strong> Para entregar e retirar as roupas no endereço escolhido.</li>
              <li><strong>Serviços de Hospedagem (Nuvem):</strong> Onde nosso sistema web e banco de dados ficam armazenados com segurança.</li>
              <li><strong>Agências de Crédito e Cobrança:</strong> Em casos de análise prévia de crédito ou inadimplência prolongada, para proteção do nosso acervo de roupas.</li>
              <li><strong>Autoridades Públicas:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">5. COMO PROTEGEMOS OS SEUS DADOS?</h3>
            <p className="text-gray-600">
              Adotamos medidas técnicas e administrativas rigorosas para proteger suas informações contra acessos não autorizados, perdas ou vazamentos. O site utiliza criptografia SSL (HTTPS) em todas as comunicações, e os dados de pagamento seguem os padrões de segurança mais altos do mercado financeiro.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6. POR QUANTO TEMPO GUARDAMOS OS SEUS DADOS?</h3>
            <p className="text-gray-600 mb-2">
              Mantemos os seus dados apenas pelo tempo necessário.
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Os dados de cadastro e histórico de aluguel permanecem ativos enquanto você tiver uma conta conosco.</li>
              <li>Mesmo se você excluir sua conta, a lei nos obriga a guardar alguns dados (como dados fiscais e de faturamento) por prazos que variam de 5 a 10 anos para fins de auditoria e defesa jurídica.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">7. QUAIS SÃO OS SEUS DIREITOS COMO TITULAR?</h3>
            <p className="text-gray-600 mb-2">
              A LGPD garante que você tem total controle sobre seus dados. Você pode nos solicitar a qualquer momento:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a lei;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço ou produto;</li>
              <li>Eliminação dos dados pessoais tratados com o seu consentimento;</li>
              <li>Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;</li>
              <li>Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;</li>
              <li>Revogação do consentimento.</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Para exercer seus direitos, entre em contato pelo e-mail <a href="mailto:faleconosco@madrinoivas.com.br" className="text-madriGold hover:underline">faleconosco@madrinoivas.com.br</a>.
            </p>
          </section>

          <p className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            Última atualização: Janeiro de 2026
          </p>
        </div>
      </div>
    </div>
  );
}