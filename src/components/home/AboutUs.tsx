import { Heart, Sparkles, Award, Users } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Amor aos Detalhes',
    description: 'Cada peça é tratada com o carinho e a dedicação que só uma empresa familiar possui.',
  },
  {
    icon: Sparkles,
    title: 'Excelência Artesanal',
    description: 'Especialistas em aluguel de trajes finos, vestidos de noiva, alta costura, joias e acessórios exclusivos.',
  },
  {
    icon: Award,
    title: 'Tradição de 18+ Anos',
    description: 'Fundada em 2006, vestimos sonhos e celebramos o amor geração após geração.',
  },
  {
    icon: Users,
    title: 'Atendimento Humanizado',
    description: 'Nossa missão vai além de vestir clientes; nós vestimos sonhos e eternizamos histórias.',
  },
];

export function AboutUs() {
  return (
    <section id="quem-somos" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-madriGold tracking-widest uppercase mb-4">Quem Somos</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-gray-900 mb-6">
            Nossa História,<br />
            <span className="text-madriGold">O Seu Sonho</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Fundada em 6 de fevereiro de 2006 no coração do bairro Campo do Galvão, em Guaratinguetá, a Madri Noivas nasceu de um sonho familiar: fazer parte dos momentos mais inesquecíveis da vida das pessoas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-6">
              Conduzida com o carinho, a dedicação e o respeito que só uma empresa familiar possui, cuidamos de cada detalhe para que o seu grande dia seja perfeito.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Sob a assinatura e a responsabilidade de nossa fundadora <strong>Teresa Franca de Oliveira Francisco</strong>, nos especializamos no aluguel de trajes finos, vestidos de noiva, alta costura, joias e acessórios exclusivos.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Há quase duas décadas, nossa missão vai muito além de vestir nossos clientes; nós vestimos sonhos, celebramos o amor e eternizamos histórias de geração em geração. Venha nos visitar e viva a experiência Madri Noivas!
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"
                alt="Interior da loja Madri Noivas"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 md:-bottom-8 md:-left-8 p-6 md:p-8 bg-white rounded-2xl shadow-xl max-w-xs">
              <p className="text-2xl md:text-3xl font-bold font-serif text-madriGold">2006</p>
              <p className="text-sm text-gray-600 mt-1">Fundação</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="w-14 h-14 rounded-xl bg-madriGold/10 flex items-center justify-center mb-4 group-hover:bg-madriGold group-hover:text-white transition-colors">
                <value.icon className="w-7 h-7 text-madriGold group-hover:text-white transition-colors" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}