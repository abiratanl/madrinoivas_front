import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn'; // Importe seu utilitário de classes

interface ActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'danger' | 'primary' | 'ghost';
  title?: string;
  className?: string;
}

export function ActionButton({ 
  icon: Icon, 
  onClick, 
  variant = 'ghost', 
  title,
  className 
}: ActionButtonProps) {
  
  // Definição de cores baseada na variante
  const variants = {
    danger: "text-gray-400 hover:text-red-600 hover:bg-red-50",
    primary: "text-gray-400 hover:text-rose-600 hover:bg-rose-50",
    ghost: "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all active:scale-90", 
        variants[variant],
        className
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}