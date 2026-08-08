
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Package, Plus, Minus, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { productService } from "../../services/productService";
import { Product } from "../../types/product";
import { auth } from "../../lib/firebase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export function Inventory() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination state
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
      setPageHistory([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const currentLastDoc = currentPage > 0 ? pageHistory[currentPage - 1] : undefined;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'inventory', debouncedSearch, currentPage],
    queryFn: () => productService.getPaginatedProducts(10, currentLastDoc, debouncedSearch),
  });

  const products = data?.products || [];
  const nextDoc = data?.lastDoc;

  const handleNextPage = () => {
    if (nextDoc) {
      setPageHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentPage] = nextDoc;
        return newHistory;
      });
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleStockUpdate = async (productId: string, quantity: number, operation: 'add' | 'set' | 'subtract', reason: string) => {
    setUpdatingId(productId);
    setErrorMsg(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("You must be logged in as an admin to update inventory.");
      }
      const res = await fetch('/api/workflows/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity, operation, reason })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update inventory');
      }
      
      await queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] });
      setStockInputs(prev => ({ ...prev, [productId]: 0 }));
      setReasonInputs(prev => ({ ...prev, [productId]: '' }));
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Inventory Management - Admin KBL Electronics</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-brand-primary" />
            Inventory Management
          </h1>
          <p className="text-fg-muted text-sm mt-1">Real-time stock control, barcode tracking, and warehouse allocation</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-white hover:bg-white/10">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg0" />
          <input 
            type="text" 
            placeholder="Search products by name, brand, or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-red-400 font-medium">Failed to load inventory products</p>
          <Button onClick={() => refetch()} className="mt-4 border-white/10 text-white hover:bg-white/10" variant="outline">Try Again</Button>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-fg-muted">
              <thead className="bg-white/5 text-xs text-fg-muted uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.length === 0 ? (
                   <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-fg0">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product: Product) => {
                    const currentQty = stockInputs[product.id] ?? 1;
                    const stock = product.stockCount ?? (product.inStock ? 15 : 0);
                    
                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          <img src={product.image} alt="" className="w-10 h-10 object-contain bg-white/5 rounded-lg p-1" />
                          <div>
                            <div className="font-bold text-white">{product.name}</div>
                            <div className="text-xs text-fg-muted">{product.brand} &bull; XAF {product.price.toFixed(0)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{product.category}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stock > 5 ? 'bg-emerald-500/10 text-emerald-400' : stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            {stock > 5 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white text-base">
                          {stock}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <input
                              type="text"
                              placeholder="Reason"
                              value={reasonInputs[product.id] || ''}
                              onChange={(e) => setReasonInputs({ ...reasonInputs, [product.id]: e.target.value })}
                              className="w-32 bg-black/50 border border-white/10 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                            />
                            <input
                              type="number"
                              min="1"
                              value={currentQty}
                              onChange={(e) => setStockInputs({ ...stockInputs, [product.id]: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-16 bg-black/50 border border-white/10 rounded-lg py-1 px-2 text-center text-xs text-white focus:outline-none focus:border-brand-primary"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === product.id}
                              onClick={() => handleStockUpdate(product.id, currentQty, 'add', reasonInputs[product.id] || 'Manual adjustment')}
                              className="h-8 border-white/10 text-xs text-white hover:bg-white/10"
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" /> Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === product.id || stock === 0}
                              onClick={() => handleStockUpdate(product.id, currentQty, 'subtract', reasonInputs[product.id] || 'Manual adjustment')}
                              className="h-8 border-white/10 text-xs text-amber-400 hover:text-amber-300 hover:bg-white/10"
                            >
                              <Minus className="h-3.5 w-3.5 mr-1" /> Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 mt-auto">
            <div className="text-sm text-fg-muted">
              Page {currentPage + 1}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage} 
                disabled={currentPage === 0 || isLoading}
                className="border-white/10 hover:bg-white/10 text-white"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage} 
                disabled={!nextDoc || isLoading || products.length < 10}
                className="border-white/10 hover:bg-white/10 text-white"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
