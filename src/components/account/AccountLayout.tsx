import { Outlet, NavLink } from 'react-router-dom';
import { User, Package, MapPin, Heart, Shield, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { EmailVerificationBanner } from './EmailVerificationBanner';

const navItems = [
  { icon: User, label: 'Profile Overview', path: '/account' },
  { icon: Package, label: 'My Orders', path: '/account/orders' },
  { icon: MapPin, label: 'Addresses', path: '/account/addresses' },
  { icon: Heart, label: 'Wishlist', path: '/account/wishlist' },
  { icon: Shield, label: 'Security', path: '/account/security' },
  { icon: Settings, label: 'Settings', path: '/account/settings' },
];

export const AccountLayout = () => {
  const { user, setUser } = useAuthStore();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <EmailVerificationBanner />
      
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-display font-bold text-xl">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-white truncate">{user.displayName || 'User'}</h3>
                <p className="text-xs text-fg-muted truncate">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/account'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                      isActive 
                        ? 'bg-brand-primary text-white' 
                        : 'text-fg-muted hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              
              <button
                onClick={() => setUser(null)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-400 hover:bg-red-400/10 mt-4"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 min-h-[600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
