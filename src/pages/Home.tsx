import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { useEffect } from "react";
import { analytics } from "../services/analyticsService";
import { ArrowRight, Zap, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/shared/ProductCard";
import { HeroSection } from "../components/home/HeroSection";
import { productService } from "../services/productService";

import { useQuery } from "@tanstack/react-query";

export function Home() {
  useEffect(() => {
    analytics.pageView('/');
  }, []);

  const { data: featuredProducts = [], 
    isError: isFeaturedError, 
    refetch: refetchFeatured 
  } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(4),
  });

  const { 
    data: flashDeals = [], 
    isError: isFlashError, 
    refetch: refetchFlash 
  } = useQuery({
    queryKey: ['products', 'flashDeals'],
    queryFn: () => productService.getFlashDeals(4),
  });

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Premium Tech & Gaming" 
        description="Discover premium electronics, gaming gear, and tech accessories at KBL Electronics. Enjoy free shipping on orders over 1,500,000 FCFA."
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Link to="/product/p-2" className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-brand-primary/50 transition-colors block">
            <div className="flex justify-between items-start mb-8 sm:mb-12">
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest text-white">Ref. #PS5802</span>
              <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-bold px-2 py-1 rounded">Gaming</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 text-white font-display">PlayStation 5</h2>
            <p className="text-xs sm:text-sm text-fg-muted">Limitless play with ultra-fast SSD.</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-white">$499.00</span>
              <span className="text-[10px] opacity-40 line-through text-white">$549.00</span>
            </div>
            <div className="absolute bottom-0 right-0 w-36 h-36 sm:w-48 sm:h-48 opacity-10 scale-125 translate-x-8 translate-y-8 text-white pointer-events-none">
              <RotateCcw className="w-full h-full" />
            </div>
          </Link>

          <div className="bg-[#003366]/30 border border-brand-accent/30 rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between overflow-hidden shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] group cursor-pointer">
            <div className="relative z-10">
              <span className="text-brand-accent font-bold text-[10px] uppercase tracking-widest mb-2 block">Business Solutions</span>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white font-display">Enterprise Grade Procurement</h2>
              <p className="text-xs sm:text-sm text-blue-100/60 leading-relaxed">Custom inventory management and bulk logistics for corporate infrastructure.</p>
            </div>
            <button className="relative z-10 w-fit text-xs sm:text-sm font-bold border-b border-brand-accent pb-1 mt-6 text-white group-hover:text-brand-accent transition-colors">
              Speak with an Architect &rarr;
            </button>
            <div className="absolute -bottom-10 -right-10 opacity-20 text-brand-accent pointer-events-none">
              <Shield className="w-36 h-36 sm:w-48 sm:h-48" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-brand-primary to-brand-primary-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-brand-primary/20">
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Flash Deal</span>
            <h3 className="text-3xl sm:text-4xl font-black mb-2 font-display">-45% OFF</h3>
            <p className="text-xs sm:text-sm mb-6 opacity-90 font-medium">Samsung Galaxy Buds2 Pro<br/>Limited quantity remaining.</p>
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 font-mono text-lg sm:text-xl font-bold">
              <div className="bg-black/20 px-3 py-2 rounded-lg">08</div>:
              <div className="bg-black/20 px-3 py-2 rounded-lg">42</div>:
              <div className="bg-black/20 px-3 py-2 rounded-lg">19</div>
            </div>
            <button className="bg-black text-white w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform min-h-[44px]">
              Secure Deal
            </button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-white/5 bg-white/5 py-8 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Free Delivery</h4>
                <p className="text-xs sm:text-sm text-fg-muted">On orders over $500</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">2-Year Warranty</h4>
                <p className="text-xs sm:text-sm text-fg-muted">Official brand guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">30-Day Returns</h4>
                <p className="text-xs sm:text-sm text-fg-muted">No questions asked</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">Express Pickup</h4>
                <p className="text-xs sm:text-sm text-fg-muted">Ready in 2 hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-brand-primary fill-current" />
                <h3 className="text-brand-primary font-bold tracking-wider uppercase text-sm">Limited Time</h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">Flash Deals</h2>
            </div>
            <Button variant="link" className="self-start md:self-auto px-0 text-white hover:text-brand-primary" asChild>
              <Link to="/deals">View all deals <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          {isFlashError ? (
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-400 mb-4 font-medium">Failed to load flash deals.</p>
              <Button onClick={() => refetchFlash()} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                Try Again
              </Button>
            </div>
          ) : flashDeals.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center text-fg-muted">
              No flash deals available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashDeals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-[var(--color-background)] border-t border-white/5 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">Shop by Category</h2>
            <p className="text-fg-muted max-w-2xl mx-auto">Explore our wide range of premium electronics organized by category.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/categories/smartphones" className="group relative h-[400px] rounded-3xl overflow-hidden bg-canvas border border-white/5 block">
              <img src="https://firebasestorage.googleapis.com/v0/b/jo-accessories-44ffa.firebasestorage.app/o/ChatGPT%20Image%20Aug%207%2C%202026%2C%2005_52_42%20PM.png?alt=media&token=1cbd87fb-a049-4c50-9945-6ad512316e11" alt="Smartphones" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" width={800} height={800} loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Smartphones</h3>
                <p className="text-fg-muted mb-4">Latest models from Apple, Samsung, Google.</p>
                <span className="inline-flex items-center text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link to="/categories/gaming" className="group relative h-[400px] rounded-3xl overflow-hidden bg-canvas border border-white/5 block">
              <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=800&auto=format&fit=crop" alt="Gaming" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" width={800} height={800} loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Gaming</h3>
                <p className="text-fg-muted mb-4">Consoles, games, and premium accessories.</p>
                <span className="inline-flex items-center text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
            <Link to="/categories/audio" className="group relative h-[400px] rounded-3xl overflow-hidden bg-canvas border border-white/5 block">
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop" alt="Audio" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60" width={800} height={800} loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Premium Audio</h3>
                <p className="text-fg-muted mb-4">Headphones, earbuds, and sound systems.</p>
                <span className="inline-flex items-center text-sm font-semibold text-white group-hover:text-brand-primary transition-colors">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-[var(--color-background)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight">New Arrivals</h2>
              <p className="text-fg-muted mt-2">The latest tech drops available now.</p>
            </div>
            <Button variant="link" className="self-start md:self-auto px-0 text-white hover:text-brand-primary" asChild>
              <Link to="/new-arrivals">View all products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          {isFeaturedError ? (
            <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-400 mb-4 font-medium">Failed to load new arrivals.</p>
              <Button onClick={() => refetchFeatured()} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                Try Again
              </Button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center text-fg-muted">
              No new arrivals found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter */}
      <section className="py-16 sm:py-24 bg-brand-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4 tracking-tight">Join the KBL Club</h2>
          <p className="text-brand-primary-100 max-w-2xl mx-auto mb-6 sm:mb-8 text-white/90 text-sm sm:text-lg">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 h-12 rounded-xl px-4 text-canvas focus:outline-none focus:ring-4 focus:ring-white/30 text-sm"
              required
              aria-label="Email address for newsletter"
            />
            <Button type="submit" variant="secondary" className="h-12 px-8 rounded-xl font-bold min-h-[48px]">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
