import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Package, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';


export function GuestTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTrackingData(null);
    try {
      const response = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      if (!response.ok) {
         const data = await response.json();
         throw new Error(data.error || 'Erreur');
      }
      const data = await response.json();
      setTrackingData({
        status: data.status,
        eta: data.status === 'delivered' ? 'Livré' : 'À définir'
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Commande introuvable avec ces informations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-12 px-4">
      <Helmet>
        <title>Suivre ma commande | KBL</title>
      </Helmet>
      
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Où est ma commande ?</h1>
          <p className="text-fg-muted">Entrez votre numéro de commande et le numéro de téléphone utilisé lors de l'achat.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Numéro de commande</label>
              <input 
                value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
                placeholder="Ex: KBL-123456" required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Téléphone</label>
              <input 
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX" required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" 
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 font-bold uppercase mt-4">
              {loading ? 'Recherche...' : 'Suivre'}
            </Button>
          </form>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        </div>

        {trackingData && (
          <div className="mt-8 bg-brand-primary/5 border border-brand-primary/20 rounded-3xl p-6 sm:p-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-brand-primary" /> Statut: Expédiée</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="font-bold">En cours de livraison</p>
                  <p className="text-sm text-fg-muted">Votre colis a quitté notre entrepôt et est en route.</p>
                  <p className="text-xs text-brand-primary mt-1 font-bold">Livraison estimée : {trackingData.eta}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
