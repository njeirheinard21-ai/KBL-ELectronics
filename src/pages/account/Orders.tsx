/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { orderService, Order } from '../../services/orderService';
import { useAuthStore } from '../../store/useAuthStore';

const STATUS_COLORS = {
  pending_payment: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  paid: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  ready_for_pickup: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  shipped: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  delivered: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
  refunded: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
};

const STATUS_LABELS = {
  pending_payment: 'En attente de paiement',
  paid: 'Payé',
  processing: 'En préparation',
  ready_for_pickup: 'Prêt pour retrait',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
  refunded: 'Remboursé'
};

export function AccountOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      orderService.getUserOrders(user.uid).then(data => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Mes commandes</h1>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-brand-primary outline-none"
        >
          <option value="all">Toutes les commandes</option>
          <option value="processing">En préparation</option>
          <option value="shipped">Expédiées</option>
          <option value="delivered">Livrées</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 animate-spin border-4 border-brand-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <Package className="w-16 h-16 text-fg-muted mb-4" />
          <h2 className="text-lg font-bold mb-2">Aucune commande trouvée</h2>
          <p className="text-fg-muted max-w-md mx-auto">
            Vous n'avez pas encore passé de commande ou aucune commande ne correspond à ce filtre.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <Link 
              key={order.id} 
              to={`/account/orders/${order.orderNumber}`}
              className="block bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.processing}`}>
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-fg-muted">
                    {new Date((order.createdAt as unknown as any)?.seconds * 1000 || 0).toLocaleDateString('fr-FR', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-fg-muted mb-1">Total</p>
                  <p className="font-bold text-brand-primary">{order.total} FCFA</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex -space-x-2 overflow-hidden">
                  {order.items.slice(0, 3).map((item: any, i: number) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1C1C1E] bg-white/5 p-1">
                      <img src={item.image || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-contain" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-10 h-10 rounded-full border-2 border-[#1C1C1E] bg-white/10 flex items-center justify-center text-xs font-bold">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-white group">
                  Détails <ChevronRight className="w-4 h-4 text-fg-muted" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
