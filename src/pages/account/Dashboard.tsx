import { useAuthStore } from '../../store/useAuthStore';
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AccountDashboard() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Bonjour, {user?.displayName || user?.email || user?.phoneNumber || 'Client'}
        </h1>
        <p className="text-fg-muted">Bienvenue dans votre espace personnel KBL Electronics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/account/orders" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
          <Package className="w-8 h-8 text-brand-primary mb-4" />
          <h3 className="font-bold mb-1">Mes commandes</h3>
          <p className="text-sm text-fg-muted mb-4">Suivre, retourner ou acheter à nouveau.</p>
          <span className="text-xs font-bold text-brand-primary group-hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
        
        <Link to="/account/wishlist" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
          <Heart className="w-8 h-8 text-brand-primary mb-4" />
          <h3 className="font-bold mb-1">Ma liste d'envies</h3>
          <p className="text-sm text-fg-muted mb-4">Vos produits favoris sauvegardés.</p>
          <span className="text-xs font-bold text-brand-primary group-hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link to="/account/addresses" className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
          <MapPin className="w-8 h-8 text-brand-primary mb-4" />
          <h3 className="font-bold mb-1">Mes adresses</h3>
          <p className="text-sm text-fg-muted mb-4">Gérer les adresses de livraison.</p>
          <span className="text-xs font-bold text-brand-primary group-hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
