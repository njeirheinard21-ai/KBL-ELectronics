import { authService } from "../../services/authService";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, ShoppingCart, User, Menu, Heart, X,
  Smartphone, Gamepad2, Headphones, Keyboard, Tag, ChevronRight, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../ui/button";
import { useCartStore, selectTotalItems } from "../../store/useCartStore";
import { useAuthStore, ExtendedUser } from "../../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../hooks/useDebounce";
import { productService } from "../../services/productService";

export function Navbar() {
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length > 2) {
        const results = await productService.searchProducts(debouncedSearch);
        return results.slice(0, 5);
      }
      return [];
    },
    enabled: debouncedSearch.length > 2,
    staleTime: 60000,
  });

  const navigate = useNavigate();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [isMobileMenuOpen]);

  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  const handleSelectProduct = (id: string) => {
    navigate(`/product/${id}`);
    setSearchQuery("");
      };

  const cartItemsCount = useCartStore(selectTotalItems);
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAdmin = async () => {
      if (user) {
        const isSuperAdmin = (user as ExtendedUser).role === 'super_admin';
        if (isSuperAdmin) {
          if (isMounted) setIsAdmin(true);
          return;
        }
        try {
          const idTokenResult = await user.getIdTokenResult();
          if (isMounted) {
            setIsAdmin(idTokenResult.claims.role === 'super_admin' || idTokenResult.claims.role === 'admin' || idTokenResult.claims.role === 'staff');
          }
        } catch {
          if (isMounted) setIsAdmin(false);
        }
      } else {
        if (isMounted) setIsAdmin(false);
      }
    };
    checkAdmin();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[var(--color-background)]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-8 lg:gap-12">
              <button 
                className="lg:hidden text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg p-1" 
                aria-label="Open navigation menu"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
              <Link to="/" className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg">
                <span className="text-2xl font-black tracking-tighter leading-none text-white">KBL</span>
                <span className="text-[10px] tracking-[0.3em] font-light opacity-60 uppercase text-white">Electronics</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-8 font-medium text-sm tracking-wide">
                <Link to="/categories/smartphones" className="text-white hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 transition-colors">Smartphones</Link>
                <Link to="/categories/gaming" className="text-white hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 transition-colors">Gaming</Link>
                <Link to="/categories/audio" className="text-white hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 transition-colors">Audio</Link>
                <Link to="/categories/accessories" className="text-white hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 transition-colors">Accessories</Link>
                <Link to="/deals" className="text-white hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md px-1 transition-colors">Deals</Link>
              </nav>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6">
              <div className="hidden md:flex relative w-full max-w-xs group z-50">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary focus:bg-black/50 transition-all placeholder:text-fg0"
                  aria-label="Search products"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
                
                {searchQuery.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-fg-muted">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product.id)}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                          >
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-contain bg-white/5 rounded-lg p-1" />
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <span className="text-sm font-medium text-white truncate">{product.name}</span>
                              <span className="text-xs text-brand-primary font-bold">${product.price.toFixed(2)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-fg-muted">No products found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 text-white">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden hover:text-brand-primary hover:bg-white/5 h-10 w-10 min-h-[44px] min-w-[44px]" 
                  aria-label="Search"
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {user && (
                  <Link to="/account">
                    <Button variant="ghost" size="icon" className="hidden sm:flex hover:text-brand-primary hover:bg-white/5 h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="Wishlist">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                
                {isAdmin && (
                  <Link to="/admin/dashboard">
                    <Button variant="ghost" size="icon" className="hover:text-brand-primary hover:bg-white/5 h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="Admin Panel">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center justify-center hover:text-brand-primary hover:bg-white/5 h-10 w-10 rounded-md transition-colors" aria-label="My Account">
                      <div className="w-8 h-8 rounded-full bg-brand-primary text-black flex items-center justify-center font-bold text-xs">
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </div>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-canvas border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-4 border-b border-white/10">
                        <p className="text-sm font-bold truncate">{user.displayName}</p>
                        <p className="text-xs text-fg-muted truncate">{user.email || user.phoneNumber}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link to="/account" className="block px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">Mon compte</Link>
                        <Link to="/account/orders" className="block px-3 py-2 text-sm hover:bg-white/5 rounded-lg transition-colors">Mes commandes</Link>
                        <button onClick={() => authService.logout()} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">Déconnexion</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => useAuthStore.getState().openAuthModal('login')} className="flex items-center justify-center text-white hover:text-brand-primary h-10 w-10 min-h-[44px] min-w-[44px] rounded-md hover:bg-white/5 transition-colors" aria-label="Log In">
                    <User className="h-5 w-5" />
                  </button>
                )}
                
                <button 
                  onClick={() => useCartStore.getState().setIsOpen(true)}
                  aria-label="Shopping Cart"
                  className="relative flex items-center justify-center text-white hover:text-brand-primary h-10 w-10 min-h-[44px] min-w-[44px] rounded-md hover:bg-white/5 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span aria-live="polite" className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-black">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/10 bg-black/95 px-4 py-3 relative z-50 overflow-hidden"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search smartphones, gaming, audio..."
                  autoFocus
                  className="w-full bg-white/10 border border-white/15 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none focus:border-brand-primary focus:bg-black placeholder:text-fg-muted"
                  aria-label="Search products on mobile"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-white p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {searchQuery.length > 2 && (
                <div className="mt-2 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-fg-muted">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            handleSelectProduct(product.id);
                            setIsMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0 min-h-[50px]"
                        >
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-contain bg-white/5 rounded-lg p-1 shrink-0" />
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-medium text-white truncate">{product.name}</span>
                            <span className="text-xs text-brand-primary font-bold">${product.price.toFixed(2)}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-fg-muted" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-fg-muted">No products found</div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60] lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-[var(--color-background)] z-[70] flex flex-col lg:hidden border-r border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <Link to="/" className="flex flex-col" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-2xl font-black tracking-tighter leading-none text-white">KBL</span>
                  <span className="text-[10px] tracking-[0.3em] font-light opacity-60 uppercase text-white">Electronics</span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  aria-label="Close menu"
                  className="text-fg-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-6">
                {/* Mobile Drawer Search Input */}
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search products..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-primary placeholder:text-fg-muted"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
                  {searchQuery.length > 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col max-h-48 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-3 text-center text-xs text-fg-muted">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <div className="flex flex-col">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => {
                                handleSelectProduct(product.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-b-0"
                            >
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-contain bg-white/5 rounded p-1 shrink-0" />
                              <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-xs font-medium text-white truncate">{product.name}</span>
                                <span className="text-[10px] text-brand-primary font-bold">${product.price.toFixed(2)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-fg-muted">No products found</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-fg-muted uppercase tracking-[0.2em] mb-2">Shop Categories</span>
                  
                  <Link to="/categories/smartphones" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-300">
                        <Smartphone className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">Smartphones</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fg-muted group-hover:text-white transition-colors" />
                  </Link>
                  
                  <Link to="/categories/gaming" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-300">
                        <Gamepad2 className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">Gaming</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fg-muted group-hover:text-white transition-colors" />
                  </Link>
                  
                  <Link to="/categories/audio" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-300">
                        <Headphones className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">Audio</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fg-muted group-hover:text-white transition-colors" />
                  </Link>
                  
                  <Link to="/categories/accessories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 group transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-brand-primary/20 transition-all duration-300">
                        <Keyboard className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">Accessories</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-fg-muted group-hover:text-white transition-colors" />
                  </Link>
                  
                  <div className="h-px w-full bg-white/10 my-2"></div>

                  <Link to="/deals" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 group transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-brand-primary" />
                      </div>
                      <span className="text-sm font-bold text-brand-primary">Special Deals</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-primary" />
                  </Link>
                </div>
                
                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/10">
                  <span className="text-[10px] font-bold text-fg-muted uppercase tracking-[0.2em]">Account & Management</span>
                  
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary text-black flex items-center justify-center font-bold text-xs">
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-white">{user.displayName || "Mon compte"}</span>
                            <span className="text-[10px] text-fg-muted truncate max-w-[160px]">{user.email || user.phoneNumber}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-fg-muted" />
                      </Link>
                      <button onClick={() => { authService.logout(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 px-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 transition-colors">
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { useAuthStore.getState().openAuthModal('login'); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-primary text-black font-bold text-xs uppercase tracking-wider w-full">
                      <User className="w-4 h-4" />
                      Connexion / Inscription
                    </button>
                  )}

                  {isAdmin && (
                    <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-center border border-white/10 group mt-1">
                      <LayoutDashboard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-amber-400">Admin Dashboard</span>
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
