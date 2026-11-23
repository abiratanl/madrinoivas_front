import { MapPin, Phone, Mail, Navigation2, ExternalLink, MessageSquare, Instagram, Facebook } from 'lucide-react';

interface Unit {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  whatsapp?: string;
  email: string;
  facebook: string;
  instagram: string;
  mapUrl: string;
  mapEmbedUrl: string;
  image: string;
}

const FACEBOOK_URL = 'https://www.facebook.com/lojamadrinoivas/?locale=pt_BR';
const INSTAGRAM_URL = 'https://www.instagram.com/madrinoivas/';

const units: Unit[] = [
  {
    id: 1,
    name: 'Madri Noivas - Guaratinguetá',
    address: 'Rua Dr. Castro Santos, 98',
    neighborhood: 'Centro',
    city: 'Guaratinguetá - SP',
    phone: '(12) 3133-7543',
    whatsapp: '(12) 98133-9322',
    email: 'faleconosco.gta@madrinoivas.com.br',
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Dr.+Castro+Santos,+98,+Centro,+Guaratinguet%C3%A1,+SP',
    mapEmbedUrl: 'https://www.google.com/maps?q=Rua%20Dr.%20Castro%20Santos%2C%2098%2C%20Centro%2C%20Guaratinguet%C3%A1%2C%20SP&output=embed',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  },
  {
    id: 2,
    name: 'Madri Noivas - Cruzeiro',
    address: 'Rua Othon Barcelos (Dr. Orthon Barcelos), 280',
    neighborhood: 'Centro',
    city: 'Cruzeiro - SP',
    phone: '(12) 3143-6987',
    email: 'faleconosco.cruzeiro@madrinoivas.com.br',
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Othon+Barcelos,+280,+Centro,+Cruzeiro,+SP',
    mapEmbedUrl: 'https://www.google.com/maps?q=Rua%20Othon%20Barcelos%2C%20280%2C%20Centro%2C%20Cruzeiro%2C%20SP&output=embed',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80',
  },
];

export function Units() {
  return (
    <section id="unidades" className="py-20 md:py-32 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-madriGold tracking-widest uppercase mb-4">Nossas Unidades</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900 mb-6">
            Venha nos <span className="text-madriGold">Visitar</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Duas unidades para melhor atendê-la. Agende sua visita e viva a experiência Madri Noivas pessoalmente.
          </p>
        </div>

        <div className="space-y-16">
          {units.map((unit, index) => (
            <article
              key={unit.id}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ${
                index % 2 === 1 ? 'lg:col-start-2' : ''
              }`}>
                <img
                  src={unit.image}
                  alt={`${unit.name} - Fachada da loja`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold font-serif">{unit.name}</h3>
                  <p className="text-amber-200 mt-1">{unit.neighborhood}, {unit.city}</p>
                </div>
              </div>

              <div className={`bg-white p-8 md:p-12 rounded-2xl shadow-lg ${
                index % 2 === 1 ? 'lg:col-start-1' : ''
              }`}>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-madriGold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-madriGold" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Endereço</h4>
                      <address className="not-italic text-gray-600 mt-1 space-y-1">
                        <p>{unit.address}</p>
                        <p>{unit.neighborhood}</p>
                        <p className="font-medium">{unit.city}</p>
                      </address>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <a
                      href={`tel:${unit.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-madriGold/5 hover:border-madriGold/20 border border-gray-100 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-madriGold/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-madriGold" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefone</p>
                        <p className="font-medium text-gray-900">{unit.phone}</p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${unit.email}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-madriGold/5 hover:border-madriGold/20 border border-gray-100 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-madriGold/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-madriGold" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">E-mail</p>
                        <p className="font-medium text-gray-900 truncate">{unit.email}</p>
                      </div>
                    </a>
                  </div>

                  {unit.whatsapp && (
                    <a
                      href={`https://wa.me/55${unit.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-gray-100 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">WhatsApp</p>
                        <p className="font-medium text-gray-900">{unit.whatsapp}</p>
                      </div>
                    </a>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <a
                      href={unit.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-madriGold/5 hover:border-madriGold/20 border border-gray-100 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-madriGold/10 flex items-center justify-center">
                        <Instagram className="w-5 h-5 text-madriGold" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Instagram</p>
                        <p className="font-medium text-gray-900">@madrinoivas</p>
                      </div>
                    </a>

                    <a
                      href={unit.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-madriGold/5 hover:border-madriGold/20 border border-gray-100 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-madriGold/10 flex items-center justify-center">
                        <Facebook className="w-5 h-5 text-madriGold" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Facebook</p>
                        <p className="font-medium text-gray-900">Madri Noivas</p>
                      </div>
                    </a>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                      href={unit.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-madriGold text-white font-semibold rounded-lg hover:bg-madriGold/90 transition-all group"
                    >
                      <Navigation2 className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      Ver no Google Maps
                    </a>
                    <a
                      href={unit.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-madriGold hover:text-madriGold hover:bg-madriGold/5 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" aria-hidden="true" />
                      Abrir Mapa
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          {units.map((unit) => (
            <div key={unit.id} className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">{unit.name} - Mapa</h4>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  src={unit.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa da ${unit.name}`}
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
