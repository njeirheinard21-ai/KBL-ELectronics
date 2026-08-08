import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function Confirmation() {
  const { orderNumber } = useParams();

  // In a real app we'd fetch the order details using orderNumber
  // For now, we use a static layout matching the requirements

  const whatsappMessage = encodeURIComponent(`Bonjour, je voudrais suivre ma commande KBL Electronics. Numéro de commande: ${orderNumber}`);
  const whatsappUrl = `https://wa.me/237600000000?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-black pt-32 pb-12 text-white">
      <Helmet>
        <title>Commande Confirmée | KBL</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary/20 text-brand-primary mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Commande Confirmée !</h1>
          <p className="text-fg-muted mb-8 max-w-md mx-auto">
            Merci pour votre achat. Nous avons reçu votre paiement et votre commande est en cours de préparation.
          </p>

          <div className="inline-block bg-black/50 border border-white/10 rounded-xl px-6 py-4 mb-10">
            <p className="text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Numéro de Commande</p>
            <p className="text-2xl font-mono text-brand-primary">{orderNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold">Détails de Livraison</h3>
              </div>
              <p className="text-sm text-fg-muted">ETA: Prêt dans 24h</p>
              <p className="text-sm font-medium mt-2">Livraison à domicile - Douala</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-brand-primary" />
                <h3 className="font-bold">Paiement</h3>
              </div>
              <p className="text-sm text-fg-muted">Statut: <span className="text-brand-primary font-bold">Réussi</span></p>
              <p className="text-sm font-medium mt-2">Via Mobile Money</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline" className="h-12 border-brand-primary text-brand-primary hover:bg-brand-primary/10">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-bold">
                <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp
              </a>
            </Button>
            <Button asChild className="h-12 font-bold flex items-center gap-2">
              <Link to="/">
                Continuer mes achats <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
