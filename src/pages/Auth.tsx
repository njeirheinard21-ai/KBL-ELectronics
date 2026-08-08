/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
  repeatPassword: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ["repeatPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function Auth() {
  const { user, isLoading: storeLoading } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!storeLoading && user) {
      const isSuperAdmin = (user as {role?: string}).role === 'super_admin';
      if (isSuperAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
      }
    }
  }, [user, storeLoading, navigate, redirect]);

  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  if (storeLoading || user) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto space-y-6 animate-pulse">
          <div className="h-10 bg-white/10 rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const onLogin = async (data: LoginFormData) => {
    setError('');
    setLoading(true);
    try {
      const user = await authService.loginWithEmail(data.email, data.password);
      const idTokenResult = await user.getIdTokenResult(true).catch(() => null);
      if (idTokenResult?.claims?.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = 'Invalid email or password.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: SignupFormData) => {
    setError('');
    setLoading(true);
    try {
      await authService.registerWithEmail(data.email, data.password, {
        displayName: data.name,
        phone: data.phone,
      });
      navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
    } catch (err: unknown) {
      console.error(err);
      const firebaseError = err as { code?: string; message?: string };
      let errorMessage = 'An error occurred during authentication';
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      const idTokenResult = await user.getIdTokenResult(true);
      if (idTokenResult.claims.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect.startsWith('/') ? redirect : `/${redirect}`);
      }
    } catch (err: unknown) {
      console.error(err);
      let errorMessage = 'An error occurred with Google login';
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login popup was closed before completing.';
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }
      setError(errorMessage);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`${isLogin ? 'Log In' : 'Sign Up'} - KBL Electronics`}</title>
      </Helmet>
      
      <div className="w-full max-w-md space-y-8 bg-white/5 border border-white/10 p-8 rounded-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            {isLogin ? 'Enter your details to access your account' : 'Join KBL Electronics for exclusive deals'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={isLogin ? handleLoginSubmit(onLogin) : handleSignupSubmit(onSignup)}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...(isLogin ? registerLogin("name" as any) : registerSignup("name"))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="John Doe"
                  />
                  {((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).name && (
                    <p className="mt-1 text-xs text-red-400">{((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...(isLogin ? registerLogin("phone" as any) : registerSignup("phone"))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                  {((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).phone && (
                    <p className="mt-1 text-xs text-red-400">{((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).phone.message}</p>
                  )}
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...(isLogin ? registerLogin("email") : registerSignup("email"))}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="name@example.com"
              />
              {((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).email && (
                <p className="mt-1 text-xs text-red-400">{((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...(isLogin ? registerLogin("password") : registerSignup("password"))}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                placeholder="••••••••"
              />
              {((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).password && (
                <p className="mt-1 text-xs text-red-400">{((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).password.message}</p>
              )}
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2" htmlFor="repeatPassword">
                  Repeat Password
                </label>
                <input
                  id="repeatPassword"
                  type="password"
                  {...(isLogin ? registerLogin("password" as any) : registerSignup("repeatPassword"))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="••••••••"
                />
                {((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).repeatPassword && (
                  <p className="mt-1 text-xs text-red-400">{((isLogin ? loginErrors : signupErrors) as Record<string, { message?: string }>).repeatPassword.message}</p>
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-12 text-sm font-bold tracking-widest" disabled={loading}>
            {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--color-background)] text-fg-muted">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-white/20 text-white hover:bg-white/10"
              onClick={handleGoogleLogin}
            >
              Google
            </Button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={toggleAuthMode}
            className="text-sm text-brand-primary hover:text-brand-primary-light font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}