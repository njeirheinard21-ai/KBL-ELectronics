/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../services/authService';
import { Button } from '../ui/button';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
});

const registerSchema = emailSchema.extend({
  fullName: z.string().min(2, "Nom requis"),
});

interface AuthContentProps {
  initialView: 'login' | 'register' | 'reset-password';
  onSuccess?: () => void;
  isModal?: boolean;
}

export function AuthContent({ initialView, onSuccess, isModal = false }: AuthContentProps) {
  const [view, setView] = useState<'login' | 'register' | 'reset-password'>(initialView);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const closeAuthModal = useAuthStore(s => s.closeAuthModal);

  const { register: regEmail, handleSubmit: handleEmail, formState: { errors: errEmail } } = useForm<any>({
    resolver: zodResolver(view === 'register' ? registerSchema : emailSchema)
  });

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    if (!isModal) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect);
    } else {
      closeAuthModal();
    }
  };

  const onSubmitEmail = async (data: any) => {
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      if (view === 'login') {
        await authService.loginWithEmail(data.email, data.password);
        handleSuccess();
      } else if (view === 'register') {
        await authService.registerWithEmail(data.email, data.password, { displayName: data.fullName });
        handleSuccess();
      } else if (view === 'reset-password') {
        await authService.resetPasswordForEmail(data.email);
        setMessage("Lien de réinitialisation envoyé par email.");
      }
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await authService.loginWithGoogle();
      handleSuccess();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Erreur de connexion Google.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
          {view === 'login' ? 'Connexion' : view === 'register' ? 'Créer un compte' : 'Mot de passe oublié'}
        </h2>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex gap-3 text-green-400">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <form onSubmit={handleEmail(onSubmitEmail)} className="space-y-4">
        {view === 'register' && (
          <div>
            <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Nom complet</label>
            <input {...regEmail("fullName")} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
            {errEmail.fullName && <p className="text-red-400 text-xs mt-1">{errEmail.fullName.message as string}</p>}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Email</label>
          <input {...regEmail("email")} type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
          {errEmail.email && <p className="text-red-400 text-xs mt-1">{errEmail.email.message as string}</p>}
        </div>

        {view !== 'reset-password' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest">Mot de passe</label>
              {view === 'login' && (
                <button type="button" onClick={() => setView('reset-password')} className="text-xs text-brand-primary hover:underline">Oublié ?</button>
              )}
            </div>
            <input {...regEmail("password")} type="password" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
            {errEmail.password && <p className="text-red-400 text-xs mt-1">{errEmail.password.message as string}</p>}
          </div>
        )}
        
        <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold uppercase tracking-widest mt-2">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : view === 'login' ? 'Se connecter' : view === 'register' ? "S'inscrire" : 'Envoyer le lien'}
        </Button>
      </form>

      {view !== 'reset-password' && (
        <>
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-canvas px-2 text-fg-muted">Ou continuer avec</span>
            </div>
          </div>
          
          <Button onClick={onGoogleLogin} disabled={isLoading} variant="outline" className="w-full h-12 hover:bg-white/5 border-white/10">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </>
      )}

      <div className="mt-8 text-center text-sm">
        {view === 'login' ? (
          <p className="text-fg-muted">
            Pas encore de compte ? <button onClick={() => setView('register')} className="text-brand-primary hover:underline font-bold">S'inscrire</button>
          </p>
        ) : view === 'register' ? (
          <p className="text-fg-muted">
            Déjà un compte ? <button onClick={() => setView('login')} className="text-brand-primary hover:underline font-bold">Se connecter</button>
          </p>
        ) : (
          <p className="text-fg-muted">
            <button onClick={() => setView('login')} className="text-brand-primary hover:underline font-bold">Retour à la connexion</button>
          </p>
        )}
      </div>
    </div>
  );
}
