import { useState, useEffect, useRef } from "react";
import { X, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { productService } from "../../services/productService";
import { Product } from "../../types/product";
import { useQueryClient } from "@tanstack/react-query";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>(() => product || {
    name: "",
    brand: "",
    price: 0,
    category: "",
    image: "",
    inStock: true,
    isNew: false,
    hasDeal: false,
    features: [""],
    rating: 0,
    reviews: 0
  });

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Focus modal
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), ""] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product?.id) {
        await productService.updateProduct(product.id, formData);
      } else {
        await productService.createProduct(formData as Omit<Product, 'id'>);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      onClose();
    } catch (error) {
      console.error("Failed to save product", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={product ? 'Edit Product' : 'Add New Product'}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col focus:outline-none"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal" className="text-fg-muted hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="pf-name" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Product Name</label>
                <input 
                  id="pf-name"
                  required 
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pf-brand" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Brand</label>
                <input 
                  id="pf-brand"
                  required 
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleChange}
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pf-category" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Category</label>
                <input 
                  id="pf-category"
                  required 
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pf-price" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Price ($)</label>
                <input 
                  id="pf-price"
                  required 
                  name="price"
                  value={formData.price || 0}
                  onChange={handleChange}
                  type="number" 
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>

                            <div className="space-y-2">
                <label htmlFor="pf-stockCount" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Stock Count</label>
                <input 
                  id="pf-stockCount"
                  required 
                  name="stockCount"
                  value={formData.stockCount || 0}
                  onChange={handleChange}
                  type="number" 
                  step="1"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>
              <div className="space-y-2 flex items-center h-full pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    name="inStock"
                    checked={formData.inStock ?? true}
                    onChange={handleChange}
                    type="checkbox" 
                    className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-primary focus:ring-brand-primary/50" 
                  />
                  <span className="text-sm font-bold text-white uppercase tracking-widest">In Stock</span>
                </label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="pf-image" className="text-xs font-bold text-fg-muted uppercase tracking-widest">Image URL</label>
                <input 
                  id="pf-image"
                  required 
                  name="image"
                  value={formData.image || ''}
                  onChange={handleChange}
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary transition-colors" 
                />
              </div>

              <div className="space-y-4 md:col-span-2 border border-white/10 rounded-xl p-4">
                <label className="text-xs font-bold text-fg-muted uppercase tracking-widest block mb-2">Features</label>
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      aria-label={`Feature ${index + 1}`}
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      type="text" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-colors" 
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="text-red-400 hover:bg-white/10">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="w-full border-dashed border-white/20">
                  + Add Feature
                </Button>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox" 
                    name="inStock"
                    checked={formData.inStock ?? true}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-white/20 bg-black text-brand-primary focus:ring-brand-primary focus:ring-offset-black"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">In Stock</div>
                    <div className="text-xs text-fg-muted">Available for immediate purchase</div>
                  </div>
                </label>

                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isNew"
                      checked={formData.isNew ?? false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-white/20 bg-black text-brand-primary focus:ring-brand-primary focus:ring-offset-black"
                    />
                    <div className="text-sm font-bold text-white">Mark as New</div>
                  </label>
                  
                  <label className="flex-1 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input 
                      type="checkbox" 
                      name="hasDeal"
                      checked={formData.hasDeal ?? false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-white/20 bg-black text-brand-primary focus:ring-brand-primary focus:ring-offset-black"
                    />
                    <div className="text-sm font-bold text-white">Flash Deal</div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/50 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose} className="border-white/10">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="product-form" 
            className="bg-brand-primary text-black hover:bg-brand-primary/90 font-bold"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
