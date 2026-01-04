import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário para combinar classes do Tailwind de forma inteligente,
 * evitando conflitos de classes duplicadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}