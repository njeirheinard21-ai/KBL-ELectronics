
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Filter, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { productService } from "../../services/productService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Product } from "../../types/product";
import { ProductForm } from "./ProductForm";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const { 
    data, 
    isLoading: loading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['admin', 'products', debouncedSearch, currentPage],
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

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await productService.deleteProduct(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Products - Admin - KBL Electronics</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Products</h1>
        <Button onClick={handleAdd} className="bg-brand-primary text-black hover:bg-brand-primary/90 font-bold">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg0" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg-muted">
            <thead className="bg-white/5 text-xs uppercase font-bold text-fg-muted border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg0">
                    Loading products...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-400">
                    <p className="mb-2">Failed to load products from database.</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Try Again
                    </Button>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg0">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center p-1">
                          <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-contain mix-blend-screen" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{product.name}</div>
                          <div className="text-xs text-fg0">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-white">XAF {product.price.toFixed(0)}</td>
                    <td className="px-6 py-4">
                      {product.inStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 uppercase tracking-widest">
                          In Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 uppercase tracking-widest">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="h-8 w-8 text-fg-muted hover:text-white hover:bg-white/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-fg-muted hover:text-red-400 hover:bg-white/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-muted hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 mt-auto">
          <div className="text-sm text-fg-muted">
            Page {currentPage + 1}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevPage} 
              disabled={currentPage === 0 || loading}
              className="border-white/10 hover:bg-white/10 text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage} 
              disabled={!nextDoc || loading || products.length < 10}
              className="border-white/10 hover:bg-white/10 text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
