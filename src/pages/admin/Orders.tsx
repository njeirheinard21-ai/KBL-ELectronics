
import { Helmet } from "react-helmet-async";
import { Search, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { orderService, Order } from "../../services/orderService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { auth } from "../../lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

export function OrdersAdmin() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  // Pagination state
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const currentLastDoc = currentPage > 0 ? pageHistory[currentPage - 1] : undefined;

  const { 
    data, 
    isLoading: loading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['admin', 'orders', currentPage],
    queryFn: () => orderService.getPaginatedOrders(10, currentLastDoc),
  });

  const orders = data?.orders || [];
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

  
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!confirm(`Change order status to ${newStatus}?`)) return;
    setUpdatingId(orderId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/workflows/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update status');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    } catch (error: unknown) { const e = error as Error;
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500/10 text-green-400';
      case 'processing': return 'bg-blue-500/10 text-blue-400';
      case 'shipped': return 'bg-purple-500/10 text-purple-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      default: return 'bg-neutral-500/10 text-fg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Orders - Admin - KBL Electronics</title>
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-bold text-white">Orders</h1>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg0" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg-muted">
            <thead className="bg-white/5 text-xs uppercase font-bold text-fg-muted border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-fg0">
                    Loading orders...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-400">
                    <p className="mb-2">Failed to load orders from database.</p>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Try Again
                    </Button>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-fg0">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order: Order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-white">{order.orderNumber || order.id?.slice(0, 8)}</td>
                  <td className="px-6 py-4">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.userId.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {order.items?.map((item: { name?: string; productId?: string; quantity?: number; image?: string; unitPrice?: number }, i: number) => (
                        <div key={i} className="flex gap-2 items-center text-xs text-fg-muted">
                          {item.image && <img src={item.image} alt={item.name} className="w-6 h-6 object-cover rounded" />}
                          <span className="truncate max-w-[120px]">{item.quantity}x {item.name || item.productId}</span>
                          <span className="text-fg-muted ml-auto whitespace-nowrap">XAF {((item.unitPrice || 0) * (item.quantity || 1)).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">XAF {(order.total || 0).toFixed(0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusUpdate(order.id!, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-widest rounded-full px-2 py-1 focus:outline-none appearance-none cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-fg-muted hover:text-white hover:bg-white/10">
                      <Eye className="h-4 w-4" />
                    </Button>
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
              disabled={!nextDoc || loading || orders.length < 10}
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
