import { useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
}



import { useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function ProductReviews( { productId }: { productId?: string }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      try {
        const q = query(collection(db, 'reviews'), where('productId', '==', productId), where('status', '==', 'approved'), limit(20));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(fetched);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, [productId]);
  
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-12 pt-12 border-t border-white/10">
      <h3 className="text-2xl font-bold text-white mb-8">Avis clients</h3>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'text-brand-primary fill-brand-primary' : 'text-white/20'}`} />
          ))}
        </div>
        <span className="text-xl font-bold text-white">{averageRating.toFixed(1)} / 5</span>
        <span className="text-sm text-fg-muted">({reviews.length} avis)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-xl bg-canvas border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{review.userName}</p>
                    <p className="text-xs text-fg-muted">{review.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-primary fill-brand-primary" />
                  <span className="font-bold">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-fg-muted mb-3">{review.comment}</p>
              {review.verified && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> Achat vérifié
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-canvas border border-white/10 h-fit">
          <h4 className="font-bold text-white mb-4">Laisser un avis</h4>
          {user ? (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-bold text-fg-muted mb-2">Note</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button type="button" key={star} onClick={() => setRating(star)}>
                      <Star className={`w-6 h-6 ${star <= rating ? 'text-brand-primary fill-brand-primary' : 'text-white/20'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-fg-muted mb-2">Commentaire</label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary outline-none min-h-[100px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                />
              </div>
              <button className="w-full py-3 rounded-xl bg-brand-primary text-black font-bold text-sm hover:bg-brand-primary-dark transition-colors">
                Envoyer l'avis
              </button>
            </form>
          ) : (
            <div className="text-center p-6 bg-black/50 rounded-xl border border-white/5">
              <p className="text-sm text-fg-muted mb-4">Veuillez vous connecter pour laisser un avis.</p>
              <button onClick={() => useAuthStore.getState().openAuthModal('login')} className="px-6 py-2 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
