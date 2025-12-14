import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className="relative w-full max-w-lg transform rounded-xl bg-neutral-900 border border-white/10 shadow-2xl transition-all flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
