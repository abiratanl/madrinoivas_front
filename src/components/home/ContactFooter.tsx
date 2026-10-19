import { useState } from 'react';
import { Instagram, Facebook, Mail, Phone, MessageSquare, MapPin, ArrowRight } from 'lucide-react';

interface ContactFooterProps {
  onPrivacyPolicyClick: () => void;
}

export function ContactFooter({ onPrivacyPolicyClick }: ContactFooterProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Endereço Principal',
      content: 'Rua Maria do Carmo Guimarães de Castro, 122 - Residencial Nino, Guaratinguetá - SP',
      action: () => copyToClipboard('Rua Maria do Carmo Guimarães de Castro, 122 - Residencial Nino, Guaratinguetá - SP', 'endereço'),
      actionLabel: 'Copiar endereço',
    },
    {
      icon: Phone,
      title: 'Telefone',
      content: '(12) 3123-4567',
      action: () => copyToClipboard('(12) 3123-4567', 'telefone'),
      actionLabel: 'Copiar telefone',
    },
    {
      icon: Mail,
      title: 'E-mail Institucional',
      content: 'faleconosco@madrinoivas.com.br',
      action: () => copyToClipboard('faleconosco@madrinoivas.com.br', 'e-mail'),
      actionLabel: 'Copiar e-mail',
    },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/madrinoivas',
      color: 'hover:text-pink-600',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/madrinoivas',
      color: 'hover:text-blue-600',
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <>
      <section id="contato" className="py-20 md:py-32 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-madriGold tracking-widest uppercase mb-4">Contato & Redes Sociais</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900 mb-6">
              Fale <span className="text-madriGold">Conosco</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Estamos prontos para atender você. Entre em contato pelos canais abaixo ou agende sua visita.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-madriGold/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-madriGold" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 mt-1">{item.content}</p>
                    <button
                      onClick={item.action}
                      className="mt-3 text-sm font-medium text-madriGold hover:underline flex items-center gap-1"
                    >
                      {copied === item.actionLabel.split(' ')[1] ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Copiado!
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          {item.actionLabel}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              <a
                href="https://wa.me/5512999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 hover:shadow-lg transition-all"
              >
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span>Fale conosco no WhatsApp</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </a>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-6">
                Siga-nos nas <span className="text-madriGold">Redes Sociais</span>
              </h3>
              <p className="text-gray-400 mb-8 max-w-sm">
                Acompanhe nossas novidades, coleções exclusivas e inspirações para o seu grande dia.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-6 py-3 bg-gray-800 rounded-full border border-gray-700 ${social.color} transition-all hover:border-gray-600 hover:bg-gray-700`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-madriGold/20 transition-colors">
                      <social.icon className="w-5 h-5 text-white group-hover:text-madriGold transition-colors" aria-hidden="true" />
                    </div>
                    <span className="font-medium hidden sm:inline">{social.name}</span>
                  </a>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-800">
                <h4 className="font-semibold mb-4">Newsletter</h4>
                <p className="text-gray-400 mb-4">Receba nossas novidades e promoções exclusivas por e-mail.</p>
                <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-madriGold focus:ring-2 focus:ring-madriGold/20"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-madriGold text-gray-900 font-semibold rounded-lg hover:bg-madriGold/90 transition-colors whitespace-nowrap"
                  >
                    Inscrever-se
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold font-serif mb-4">
                <span className="text-madriGold">Madri</span> Noivas
              </h3>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Há quase duas décadas transformando sonhos em realidade. Vestidos de noiva, trajes finos e alta costura para o seu grande dia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <nav className="space-y-2">
                <a href="#colecao" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Nossa Coleção</a>
                <a href="#quem-somos" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Quem Somos</a>
                <a href="#unidades" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Nossas Unidades</a>
                <a href="#contato" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Contato</a>
                <a href="/auth/login" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Área Restrita</a>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <nav className="space-y-2">
                <button
                  onClick={onPrivacyPolicyClick}
                  className="block text-left text-gray-400 hover:text-madriGold transition-colors text-sm"
                >
                  Política de Privacidade (LGPD)
                </button>
                <a href="#" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Termos de Uso</a>
                <a href="#" className="block text-gray-400 hover:text-madriGold transition-colors text-sm">Política de Cookies</a>
              </nav>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {currentYear} Madri Noivas. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-sm">
                Desenvolvido com carinho por <a href="#" className="text-madriGold hover:underline">Tech Siblings</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}