import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, ExtendedUser } from "../../store/useAuthStore";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Menu,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Warehouse,
  TrendingUp,
  FileText,
  BarChart2,
  Activity
} from "lucide-react";
import { Button } from "../ui/button";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Staff", href: "/admin/staff", icon: Users },
  { name: "Marketing", href: "/admin/marketing", icon: TrendingUp },
  { name: "CMS", href: "/admin/cms", icon: FileText },
  { name: "Reporting", href: "/admin/reporting", icon: BarChart2 },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('Super Admin');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: loading } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (loading) return;
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }

      const isSuperAdmin = (user as ExtendedUser).role === 'super_admin';

      if (isSuperAdmin) {
        if (isMounted) {
          setIsAdmin(true);
          setUserRole('Super Admin');
        }
        return;
      }

      try {
        const idTokenResult = await Promise.resolve({ claims: { role: user.role } });
        if (!isMounted) return;
        if (idTokenResult.claims.role === 'super_admin' || idTokenResult.claims.role === 'admin' || idTokenResult.claims.role === 'staff') {
          setIsAdmin(true);
          setUserRole(idTokenResult.claims.role === 'super_admin' ? 'Super Admin' : 'Admin Staff');
        } else {
          setIsAdmin(false);
          navigate("/", { replace: true });
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
          navigate("/", { replace: true });
        }
      }
    };

    verifyAdmin();
    return () => { isMounted = false; };
  }, [user, loading, navigate]);


  if (loading || isAdmin === null) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } flex-shrink-0 bg-white/5 border-r border-white/10 transition-all duration-300 hidden md:flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
          <Link to="/" className="text-xl font-display font-bold text-white whitespace-nowrap overflow-hidden">
            {isSidebarOpen ? "KBL ADMIN" : "KBL"}
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== "/admin");
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-brand-primary text-white" 
                        : "text-fg-muted hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-fg-muted hover:text-white hover:bg-white/10 transition-colors ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="font-medium">Exit Admin</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden md:flex text-fg-muted hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg0" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-fg-muted hover:text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-primary"></span>
            </Button>
            
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-sm uppercase">
                {user?.displayName ? user.displayName.substring(0, 2) : (user?.email ? user.email.substring(0, 2) : 'AD')}
              </div>
              <div className="hidden sm:block text-sm">
                <div className="text-white font-medium">{user?.displayName || 'Super Admin'}</div>
                <div className="text-brand-primary text-xs font-semibold tracking-wider uppercase mt-0.5">{userRole}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-fg0 hidden sm:block" />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
