import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouteGuard } from '../components/RouteGuard';
import { useAuthStore } from '../store/useAuthStore';

// Mock zustand store
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: vi.fn()
}));

describe('Auth Guard', () => {
  it('redirects to auth if not logged in', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: null, isLoading: false, setUser: vi.fn(), clearUser: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <RouteGuard><div>Protected Content</div></RouteGuard>
      </MemoryRouter>
    );
    // Because it navigates away, 'Protected Content' should not be rendered
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders content if logged in', () => {
    vi.mocked(useAuthStore).mockReturnValue({ 
      user: { uid: '1', role: 'customer', email: 'a@a.com', displayName: 'a' } as unknown as import('firebase/auth').User, 
      isLoading: false, 
      setUser: vi.fn(), 
      clearUser: vi.fn() 
    });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <RouteGuard><div>Protected Content</div></RouteGuard>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).not.toBeNull();
  });

  it('rejects customer from admin route', () => {
    vi.mocked(useAuthStore).mockReturnValue({ 
      user: { uid: '1', role: 'customer', email: 'a@a.com', displayName: 'a' } as unknown as import('firebase/auth').User, 
      isLoading: false, 
      setUser: vi.fn(), 
      clearUser: vi.fn() 
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <RouteGuard requireAdmin><div>Admin Content</div></RouteGuard>
      </MemoryRouter>
    );
    // Should show "Access Denied" or navigate away, not render admin content
    expect(screen.queryByText('Admin Content')).toBeNull();
  });
});
