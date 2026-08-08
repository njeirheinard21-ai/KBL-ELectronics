import { create } from 'zustand';
import { User } from 'firebase/auth';

export interface ExtendedUser extends User {
  role?: string;
}

interface AuthState {
  user: ExtendedUser | null;
  isLoading: boolean;
  authModalOpen: boolean;
  authModalView: 'login' | 'register' | 'reset-password';
  setUser: (user: ExtendedUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  openAuthModal: (view?: 'login' | 'register' | 'reset-password') => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  authModalOpen: false,
  authModalView: 'login',
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  openAuthModal: (view = 'login') => set({ authModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
