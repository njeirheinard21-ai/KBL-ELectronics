
import { Helmet } from "react-helmet-async";
import { Search, Filter, Mail, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { userService, UserProfile } from "../../services/userService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export function CustomersAdmin() {
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const currentLastDoc = currentPage > 0 ? pageHistory[currentPage - 1] : undefined;

  const { 
    data, 
    isLoading: loading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['admin', 'customers', currentPage],
    queryFn: () => userService.getPaginatedUsers(10, currentLastDoc),
  });

  const customers = data?.users || [];
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

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Customers - Admin - KBL Electronics</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Customers</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg0" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg-muted">
            <thead className="bg-white/5 text-xs uppercase font-bold text-fg-muted border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg0">
                    Loading customers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-400">
                    <p className="mb-2">Failed to load customers from database.</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Try Again
                    </Button>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg0">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer: UserProfile) => (
                <tr key={customer.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{customer.displayName || 'Unknown User'}</div>
                    <div className="text-xs text-fg0">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4">{customer.ordersCount || 0}</td>
                  <td className="px-6 py-4 font-bold text-white">XAF {(customer.totalSpent || 0).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400`}>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-muted hover:text-white hover:bg-white/10">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-muted hover:text-white hover:bg-white/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
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
              disabled={currentPage === 0 || loading}
              className="border-white/10 hover:bg-white/10 text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage} 
              disabled={!nextDoc || loading || customers.length < 10}
              className="border-white/10 hover:bg-white/10 text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
