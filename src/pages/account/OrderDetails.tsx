/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, AlertTriangle, RotateCcw } from 'lucide-react';
import { Order } from '../../services/orderService';
import { Button } from '../../components/ui/button';

export function AccountOrderDetails() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      try {
        const { orderService } = await import('../../services/orderService');
        const fetched = await orderService.getOrderByNumber(orderNumber);
        setOrder(fetched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 animate-spin border-4 border-brand-primary border-t-transparent rounded-full" /></div>;
  if (!order) return <div>Commande introuvable</div>;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/account/orders" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-display font-bold text-white">Commande {order.orderNumber}</h1>
      </div>

      {/* Timeline Stepper */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-bold mb-6">Suivi de commande</h3>
        <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-white/10">
          <div className="relative">
            <div className="absolute -left-6 w-[10px] h-[10px] rounded-full bg-brand-primary border-4 border-[#1C1C1E] box-content top-1.5" />
            <p className="font-bold">Confirmée</p>
            <p className="text-xs text-fg-muted mt-1">Le 12/08/2026 à 10:30</p>
          </div>
          <div className="relative">
            <div className="absolute -left-6 w-[10px] h-[10px] rounded-full bg-brand-primary border-4 border-[#1C1C1E] box-content top-1.5" />
            <p className="font-bold">En préparation</p>
            <p className="text-xs text-fg-muted mt-1">Le 12/08/2026 à 14:00</p>
          </div>
          <div className="relative">
            <div className="absolute -left-6 w-[10px] h-[10px] rounded-full bg-brand-primary border-4 border-[#1C1C1E] box-content top-1.5 animate-pulse" />
            <p className="font-bold text-brand-primary">Expédiée</p>
            <p className="text-xs text-fg-muted mt-1">Le 13/08/2026 à 09:15</p>
          </div>
          <div className="relative opacity-50">
            <div className="absolute -left-6 w-[10px] h-[10px] rounded-full bg-white/20 border-4 border-[#1C1C1E] box-content top-1.5" />
            <p className="font-bold">Livrée</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Informations</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-fg-muted">Livraison à</p>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.city}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-fg-muted">Paiement</p>
              <p className="font-medium">Mobile Money (Payé)</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Articles</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/50 rounded-lg" />
                  <div>
                    <p className="font-medium">{item.name || 'Produit'}</p>
                    <p className="text-fg-muted">Qté: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-brand-primary">{item.price} FCFA</p>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-white/10 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-brand-primary">{order.total} FCFA</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button onClick={handlePrintReceipt} variant="outline" className="flex-1 border-white/20">
          <Download className="w-4 h-4 mr-2" /> Télécharger le reçu
        </Button>
        <Button variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
          <AlertTriangle className="w-4 h-4 mr-2" /> Signaler un problème
        </Button>
        <Button className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" /> Acheter à nouveau
        </Button>
      </div>
    </div>
  );
}
