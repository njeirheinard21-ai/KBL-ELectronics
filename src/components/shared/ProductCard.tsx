import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Star, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Product } from "../../types/product";
import { cn } from "../../lib/utils";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlistStore();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isWishlisted = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWishlisted) {
      removeWishlist(product.id);
    } else {
      addWishlist(product);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 transition-all hover:border-brand-primary/50">
      {/* Badges */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="rounded bg-brand-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            New
          </span>
        )}
        {product.hasDeal && product.originalPrice && (
          <span className="rounded bg-brand-accent px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            Save {Math.round(product.originalPrice - product.price)} FCFA
          </span>
        )}
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
        <Button 
          variant="secondary" 
          size="icon" 
          className={cn("h-10 w-10 min-h-[40px] min-w-[40px] rounded-full backdrop-blur shadow-sm border border-white/10", isWishlisted ? "bg-brand-primary text-white" : "bg-white/10 text-white hover:bg-brand-primary hover:text-white")} 
          aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} to wishlist`}
          onClick={toggleWishlist}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative aspect-square mb-4 sm:mb-6 overflow-hidden rounded-2xl bg-white/5 flex items-center justify-center p-4 sm:p-6 border border-white/5">
        <img src={product.image} alt={product.name} width={400} height={400} loading="lazy" decoding="async" className="object-contain h-full w-full transition-transform duration-500 group-hover:scale-110 mix-blend-screen" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="rounded bg-black/80 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white border border-white/10">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-1 text-[10px] font-mono opacity-50 uppercase tracking-widest text-white">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.category}</span>
          </div>
          <div className="flex items-center text-brand-primary">
            <Star className="h-3 w-3 fill-current" />
            <span className="ml-1 text-[10px] font-bold">{product.rating}</span>
            <span className="ml-1 text-[10px] text-fg0 opacity-60">({product.reviews})</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`} className="mb-4 sm:mb-6 line-clamp-2 text-sm sm:text-base font-bold leading-snug text-white group-hover:text-brand-primary transition-colors font-display tracking-wide">
          {product.name}
        </Link>
        
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-fg0 opacity-60 line-through font-mono">${product.originalPrice.toFixed(2)}</span>
            )}
            <span className="font-display text-lg sm:text-xl font-bold text-white">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          <Button 
            size="icon" 
            variant="default"
            className={cn("h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl transition-transform active:scale-95 bg-white text-black hover:bg-brand-primary hover:text-white font-bold", (!product.inStock || added) && "opacity-50 grayscale cursor-not-allowed")}
            disabled={!product.inStock || added}
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
