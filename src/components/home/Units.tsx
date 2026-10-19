import { MapPin, Phone, Mail, Clock, Navigation2, ExternalLink } from 'lucide-react';

interface Unit {
  id: number;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
  mapUrl: string;
  mapEmbedUrl: string;
  image: string;
}

const units: Unit[] = [
  {
    id: 1,
    name: 'Unidade Guaratinguetá-SP',
    address: 'Rua Maria do Carmo Guimarães de Castro, 122',
    neighborhood: 'Residencial Nino',
    city: 'Guaratinguetá - SP',
    phone: '(12) 3123-4567',
    email: 'guaratingueta@madrinoivas.com.br',
    hours: 'Seg a Sex: 9h às 18h | Sáb: 9h às 14h',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Maria+do+Carmo+Guimar%C3%A3es+de+Castro,+122,+Guaratinguet%C3%A1,+SP',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.123456789!2d-45.123456!3d-22.812345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8d123456789ab%3A0x123456789abcdef!2sRua%20Maria%20do%20Carmo%20Guimar%C3%A3es%20de%20Castro%2C%20122%20-%20Residencial%20Nino%2C%20Guaratinguet%C3%A1%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1234567890',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  },
  {
    id: 2,
    name: 'Unidade Cruzeiro-SP',
    address: 'Avenida Principal, 456',
    neighborhood: 'Centro',
    city: 'Cruzeiro - SP',
    phone: '(12) 3123-7890',
    email: 'cruzeiro@madrinoivas.com.br',
    hours: 'Seg a Sex: 9h às 18h | Sáb: 9h às 13h',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Avenida+Principal,+456,+Centro,+Cruzeiro,+SP',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.123456789!2d-44.987654!3d-22.567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8d987654321ab%3A0xfedcba9876543210!2sAvenida%20Principal%2C%20456%20-%20Centro%2C%20Cruzeiro%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1234567890',
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

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-lg bg-madriGold/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-madriGold" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horário de Funcionamento</p>
                      <p className="font-medium text-gray-900">{unit.hours}</p>
                    </div>
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