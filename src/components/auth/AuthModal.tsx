import { useAuthStore } from '../../store/useAuthStore';
import { AuthContent } from './AuthContent';
import { X } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, closeAuthModal } = useAuthStore();

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative bg-canvas border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10 shadow-2xl">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <AuthContent onSuccess={closeAuthModal} initialView="login" />
      </div>
    </div>
  );
};
