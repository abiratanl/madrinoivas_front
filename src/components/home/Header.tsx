import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#colecao', label: 'Coleção' },
  { href: '#quem-somos', label: 'Quem Somos' },
  { href: '#unidades', label: 'Unidades' },
  { href: '#contato', label: 'Contato' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 font-serif hover:opacity-80 transition-opacity"
            aria-label="Madri Noivas - Página inicial"
          >
            <span className="text-madriGold">Madri</span> Noivas
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-sm font-medium text-gray-600 hover:text-madriGold transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-madriGold hover:text-madriGold transition-all"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              Área Restrita
            </a>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <a
              href="/auth/login"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-madriGold hover:text-madriGold transition-all"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Área Restrita</span>
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slide-down">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href);
                  }}
                  className="px-2 py-2 text-base font-medium text-gray-600 hover:text-madriGold transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/auth/login"
                className="flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-madriGold hover:text-madriGold transition-all mt-2"
              >
                <Lock className="w-5 h-5" aria-hidden="true" />
                Área Restrita
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}