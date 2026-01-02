import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock do matchMedia para resolver o erro nos testes
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // Simula tema claro (light mode) por padrão
    media: query,
    onchange: null,
    addListener: vi.fn(), // Depreciado
    removeListener: vi.fn(), // Depreciado
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});