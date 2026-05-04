'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'drawer' | 'centered';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  variant = 'drawer' 
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`relative w-full bg-[#1e293b] border border-white/10 shadow-2xl transition-all duration-500 animate-in ${
          variant === 'drawer' 
            ? 'rounded-t-[40px] max-h-[92vh] slide-in-from-bottom sm:rounded-[32px] sm:max-w-md sm:slide-in-from-bottom-0 sm:zoom-in-95' 
            : 'rounded-[32px] max-w-lg zoom-in-95 slide-in-from-bottom-4'
        } overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[10px] font-bold text-[#f6d365] uppercase tracking-[0.2em] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
