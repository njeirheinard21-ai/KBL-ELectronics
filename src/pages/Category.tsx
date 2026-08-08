import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Filter, SlidersHorizontal, } from "lucide-react";
import { productService } from "../services/productService";
import { useState, useMemo } from "react";
import { ProductCard } from "../components/shared/ProductCard";
import { useQuery } from "@tanstack/react-query";

export function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const isDealsPage = location.pathname === '/deals' || categoryId === 'deals';

  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const { 
    data: products = [], 
    isLoading: loading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['products', 'category', isDealsPage ? 'deals' : categoryId],
    queryFn: async () => {
      if (isDealsPage) {
        return await productService.getFlashDeals(100);
      }
      if (categoryId) {
        const formattedCategory = categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' ');
        const data = await productService.getProductsByCategory(formattedCategory);
        if (data.length === 0) {
          const allProducts = await productService.getAllProducts();
          return allProducts.filter(p => p.category.toLowerCase().includes(categoryId.toLowerCase()));
        }
        return data;
      } else {
        return await productService.getAllProducts();
      }
    },
  });

  const displayCategory = isDealsPage
    ? 'Special Deals'
    : categoryId 
    ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' ') 
    : 'All Products';

  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand));
    return Array.from(uniqueBrands).sort();
  }, [products]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }

    return result;
  }, [products, selectedBrands, priceRange, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Helmet>
        <title>{`${displayCategory} - KBL Electronics`}</title>
        <meta name="description" content={`Browse top ${displayCategory} at KBL Electronics.`} />
        <link rel="canonical" href={`https://kbl-electronics.com/categories/${categoryId || ''}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://kbl-electronics.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": displayCategory,
                "item": `https://kbl-electronics.com/categories/${categoryId || ''}`
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-fg-muted hover:text-white transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">{displayCategory}</h1>
            <p className="text-fg-muted mt-4 max-w-2xl">
              {isDealsPage 
                ? "Discover unbeatable limited-time discounts on top electronics and gaming gear." 
                : `Browse our extensive collection of high-quality ${displayCategory.toLowerCase()} from the best brands in the industry.`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-fg-muted">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`w-full md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-white font-bold pb-4 border-b border-white/10">
              <SlidersHorizontal className="w-5 h-5" />
              <h2>Filters</h2>
            </div>
            
            {/* Brands */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Brands</h3>
              <div className="space-y-3">
                {brands.map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-brand-primary border-brand-primary' : 'border-white/20 group-hover:border-white/50'}`}>
                      {selectedBrands.includes(brand) && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-white font-medium' : 'text-fg-muted group-hover:text-white'}`}>{brand}</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price Range */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Max Price</h3>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100"
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full accent-brand-primary h-1 bg-white/10 rounded-full appearance-none outline-none"
              />
              <div className="flex justify-between text-xs text-fg-muted mt-2">
                <span>$0</span>
                <span className="text-white font-medium">${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {isError ? (
            <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-red-400 mb-2">Error loading products</h2>
              <p className="text-fg-muted mb-6">There was a problem fetching the products for this category.</p>
              <button 
                onClick={() => refetch()}
                className="px-6 py-2.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors font-medium text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-2">No products found</h2>
              <p className="text-fg-muted">Try adjusting your filters to find what you're looking for.</p>
              {(selectedBrands.length > 0 || priceRange[1] < 5000) && (
                <button 
                  onClick={() => { setSelectedBrands([]); setPriceRange([0, 5000]); }}
                  className="mt-6 text-brand-primary hover:text-white font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
