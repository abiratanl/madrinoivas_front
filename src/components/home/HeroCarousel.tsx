import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1920&q=80',
    alt: 'Noiva em vestido de renda elegante',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80',
    alt: 'Vestido de noiva clássico com cauda longa',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1566206094132-3d5a0f6074b2?w=1920&q=80',
    alt: 'Traje fino masculino para casamento',
  },
];

const fallbackImage = 'https://placehold.co/1920x1080/f3f4f6/a3a3a3?text=Madri+Noivas';

export function HeroCarousel() {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const handleImageError = (id: number) => {
    setErrorImages((prev) => new Set(prev).add(id));
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        speed={1000}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        className="absolute inset-0"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <img
              src={errorImages.has(slide.id) ? fallbackImage : slide.image}
              alt={slide.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                loadedImages.has(slide.id) || errorImages.has(slide.id) ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => handleImageLoad(slide.id)}
              onError={() => handleImageError(slide.id)}
            />
            
            {!loadedImages.has(slide.id) && !errorImages.has(slide.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-madriGold border-t-transparent" />
              </div>
            )}

            <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
              <div className="w-full max-w-3xl text-center text-white animate-fade-up">
                <p className="text-sm md:text-base font-medium tracking-widest uppercase text-amber-200 mb-4">
                  Coleção 2026
                </p>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight mb-6">
                  Você vive o momento,<br />
                  <span className="text-amber-300">nós vestimos a memória.</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
                  Há duas décadas transformando sonhos em realidade. Vestidos de noiva, trajes finos e alta costura para o seu grande dia.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="#colecao"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#colecao')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-gray-900 bg-white rounded-full hover:bg-amber-50 hover:shadow-xl transition-all duration-300"
                  >
                    Ver Coleção
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                  <a
                    href="https://wa.me/5512999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white rounded-full hover:bg-white/10 hover:shadow-xl transition-all duration-300"
                  >
                    Agendar Visita
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors hidden md:block"
        aria-label="Slide anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors hidden md:block"
        aria-label="Próximo slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <a
          href="#colecao"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#colecao')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-3 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Rolar para coleção"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}