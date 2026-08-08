import { useEffect, useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useCartStore, selectTotalItems, selectSubtotal } from '../../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const FREE_SHIPPING_THRESHOLD = 50000;

export function SlideOverCart() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen } = useCartStore();
  const totalItems = useCartStore(selectTotalItems);
  const subtotal = useCartStore(selectSubtotal);
  const navigate = useNavigate();

  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState<{ amount: number, code: string } | null>(null);
  
  // Re-validate against DB when opened
  useEffect(() => {
    let mounted = true;
    if (isOpen && items.length > 0) {
      const validate = async () => {
        setValidating(true);
        try {
          const productIds = items.map(i => i.product.id);
          // We can fetch individually or in a batch if the service supports it
          // Let's assume we can fetch them individually for now
          const freshProducts = await Promise.all(
            productIds.map(id => productService.getProductById(id).catch(() => null))
          );
          
          if (!mounted) return;

          const newWarnings: Record<string, string> = {};
          
          items.forEach(item => {
            const fresh = freshProducts.find(p => p?.id === item.product.id);
            if (!fresh) {
              newWarnings[item.product.id] = "Produit indisponible.";
              // Optional: maybe auto-remove, but warning is safer
            } else {
              if (fresh.price !== item.product.price) {
                newWarnings[item.product.id] = `Le prix a changé (était ${item.product.price} FCFA).`;
                // Update local product price in store
                useCartStore.getState().updateItemProduct(item.product.id, fresh);
              }
              const stock = typeof fresh.stockCount === 'number' ? fresh.stockCount : (fresh.inStock ? 99 : 0);
              if (stock < item.quantity) {
                newWarnings[item.product.id] = `Seulement ${stock} en stock.`;
                updateQuantity(item.product.id, stock);
              }
            }
          });
          
          setWarnings(newWarnings);
        } catch (e) {
          console.error("Failed to validate cart", e);
        } finally {
          if (mounted) setValidating(false);
        }
      };
      validate();
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy validation
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount({ amount: subtotal * 0.1, code: 'WELCOME10' });
    } else {
      alert("Code promo invalide");
    }
  };

  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-canvas border-l border-white/10 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-primary" />
            <h2 className="text-xl font-display font-bold text-white tracking-tight">Mon Panier</h2>
            <span className="bg-brand-primary/20 text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItems}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white min-h-[44px] min-w-[44px]"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="p-4 sm:p-6 bg-brand-primary/5 border-b border-white/10">
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white mb-2">
            <span>Livraison Gratuite</span>
            <span>
              {remainingForFreeShipping > 0 
                ? `Encore ${remainingForFreeShipping} FCFA` 
                : 'Acquise !'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-fg-muted mt-10">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Votre panier est vide</p>
              <Button 
                onClick={() => setIsOpen(false)} 
                variant="secondary" 
                className="mt-6 font-bold"
              >
                Continuer mes achats
              </Button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 p-2 flex-shrink-0 flex items-center justify-center">
                  <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-screen" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm line-clamp-2 leading-snug">{product.name}</h4>
                    <p className="text-brand-primary font-bold mt-1">{product.price} FCFA</p>
                    {warnings[product.id] && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {warnings[product.id]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-black/50 rounded-lg border border-white/10">
                      <button 
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-2 hover:bg-white/10 text-white min-h-[44px] min-w-[44px]"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white font-bold text-sm w-6 text-center">{quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-2 hover:bg-white/10 text-white min-h-[44px] min-w-[44px]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-fg-muted hover:text-red-400 min-h-[44px] min-w-[44px]"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5 space-y-4">
            
            <form onSubmit={applyPromo} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Code Promo" 
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 text-sm text-white focus:border-brand-primary outline-none min-h-[44px]"
              />
              <Button type="submit" variant="secondary" className="px-4 text-xs font-bold min-h-[44px]">
                Appliquer
              </Button>
            </form>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-fg-muted">
                <span>Sous-total</span>
                <span className="text-white">{subtotal} FCFA</span>
              </div>
              {discount && (
                <div className="flex justify-between text-brand-accent">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Promo ({discount.code})
                  </span>
                  <span>-{discount.amount} FCFA</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-brand-primary">{subtotal - (discount?.amount || 0)} FCFA</span>
              </div>
            </div>

            <Button 
              onClick={handleCheckout}
              disabled={validating}
              className="w-full h-14 rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2"
            >
              Commander <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
