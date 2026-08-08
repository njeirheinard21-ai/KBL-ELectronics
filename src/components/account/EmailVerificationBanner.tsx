import { useAuthStore } from '../../store/useAuthStore';
import { AlertCircle } from 'lucide-react';

export function EmailVerificationBanner() {
  const { user } = useAuthStore();

  if (!user || !user.email || user.emailVerified) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-amber-400">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Veuillez vérifier votre adresse email ({user.email}) pour sécuriser votre compte.</span>
        </div>
      </div>
    </div>
  );
}
