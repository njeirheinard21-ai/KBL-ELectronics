import { analytics } from "../services/analyticsService";

import { Check, ChevronDown, ChevronUp, MapPin, Store, CreditCard, Banknote, ShieldCheck, CheckCircle, RefreshCcw, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import {  useState, useEffect } from 'react';
import {  Helmet } from 'react-helmet-async';
import {  useNavigate, Link } from 'react-router-dom';
import {  useForm as useReactHookForm } from 'react-hook-form';
import {  zodResolver } from '@hookform/resolvers/zod';
import {  z } from 'zod';

import {  Button } from '../components/ui/button';
import {  useCartStore, selectTotalItems, selectSubtotal } from '../store/useCartStore';
import {  useAuthStore } from '../store/useAuthStore';
import {  paymentService } from '../services/paymentService';
import {  cn } from '../lib/utils';
import {  orderService } from '../services/orderService';

const contactSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  phone: z.string().regex(/^\+237 6[0-9]{2} [0-9]{3} [0-9]{3}$/, "Format invalide: +237 6XX XXX XXX"),
  email: z.string().email("Email invalide").optional().or(z.literal('')),
});

const deliverySchema = z.object({
  city: z.string().min(1, "Ville requise"),
  quarter: z.string().min(2, "Quartier requis"),
  landmark: z.string().min(2, "Point de repère requis"),
  notes: z.string().optional(),
});

const pickupSchema = z.object({
  storeId: z.string().min(1, "Boutique requise"),
});

const SHIPPINGS_ZONES = [
  { id: '1', name: 'Douala - Centre', cities: ['Douala'], fee_xaf: 1000, eta_days: 1 },
  { id: '2', name: 'Yaoundé - Centre', cities: ['Yaoundé'], fee_xaf: 1500, eta_days: 2 },
];

const STORES = [
  { id: 's1', name: 'KBL Akwa', address: 'Bd de la Liberté', city: 'Douala', phone: '+237 600000000', hours: '8h - 20h', eta: 'Prêt dans 2h' },
  { id: 's2', name: 'KBL Yaoundé', address: 'Bastos', city: 'Yaoundé', phone: '+237 600000001', hours: '9h - 19h', eta: 'Prêt dans 24h' }
];

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItems);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fulfilmentType, setFulfilmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'orange_money' | 'card' | 'bank_transfer' | 'cash_on_delivery'>('mtn_momo');
  const [momoPhone, setMomoPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  const { register: regContact, handleSubmit: handleContact, formState: { errors: errContact }, setValue: setContactValue, getValues: getValuesContact } = useReactHookForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: user?.displayName || '', email: user?.email || '', phone: '' }
  });

  const { register: regDelivery, handleSubmit: handleDelivery, formState: { errors: errDelivery }, getValues: getValuesDelivery } = useReactHookForm({
    resolver: zodResolver(deliverySchema)
  });

  const { register: regPickup, handleSubmit: handlePickup, formState: { errors: errPickup } } = useReactHookForm({
    resolver: zodResolver(pickupSchema)
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedCity = getValuesDelivery('city');

  useEffect(() => {
    if (fulfilmentType === 'delivery') {
      const zone = SHIPPINGS_ZONES.find(z => z.cities.includes(selectedCity));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingFee(zone ? zone.fee_xaf : 2000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingFee(0);
    }
  }, [selectedCity, fulfilmentType]);

  useEffect(() => {
    if (items.length > 0) {
      analytics.beginCheckout(subtotal, items);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      navigate('/');
    }
  }, [items, navigate, isSubmitting]);

  const total = subtotal + shippingFee;

  const formatCameroonPhone = (value: string) => {
    const cleaned = ('' + value).replace(/\D/g, '');
    const match = cleaned.match(/^237(6\d{2})(\d{3})(\d{3})$/);
    if (match) return `+237 ${match[1]} ${match[2]} ${match[3]}`;
    if (cleaned.startsWith('237')) return `+237 ${cleaned.slice(3)}`;
    return value;
  };

  const onContactSubmit = () => setStep(2);
  const onFulfilmentSubmit = () => { setStep(3); analytics.paymentStarted("cart_checkout", total); };

  const placeOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const contactData = getValuesContact();
      const delData = getValuesDelivery();
      
      const orderData = {
        items: items.map(i => ({ id: i.product.id, quantity: i.quantity })),
        shippingAddress: {
          fullName: contactData.fullName || 'Client',
          street: delData.quarter + (delData.landmark ? ', ' + delData.landmark : ''),
          city: delData.city || 'Douala',
          postalCode: '00000',
          phone: contactData.phone || momoPhone || '+237 600 000 000'
        }
      };
      
      const { id: order_id, orderNumber } = await orderService.createOrder(orderData);
      
      const initRes = await paymentService.initiatePayment({
        orderId: order_id,
        paymentMethod: paymentMethod,
        phone: contactData.phone || momoPhone
      });

      if (!initRes.success) {
        throw new Error(initRes.error || "Echec de l'initialisation du paiement");
      }

      clearCart();
      
      if (initRes.authorizationUrl) {
         window.location.href = initRes.authorizationUrl;
         return; 
      }

      navigate(`/order/confirmation/${orderNumber}`);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 text-white">
      <Helmet>
        <title>Paiement Sécurisé | KBL</title>
      </Helmet>
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 -z-10" />
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", step >= s ? "bg-brand-primary text-black" : "bg-canvas border border-white/20 text-white/50")}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => step > 1 && setStep(1)} className="w-full flex items-center justify-between p-6 bg-white/5" disabled={step === 1}>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-display font-bold">1. Contact</span>
                  {step > 1 && <span className="text-sm text-brand-primary">Modifier</span>}
                </div>
                {step === 1 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {step === 1 && (
                <div className="p-6 pt-0">
                  <form onSubmit={handleContact(onContactSubmit)} className="space-y-4 mt-4">
                    {!user && (
                      <div className="mb-4 text-sm">
                        <Link to="/auth?redirect=/checkout" className="text-brand-primary hover:underline">J'ai déjà un compte / Se connecter</Link>
                      </div>
                    )}
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Nom complet</label>
                      <input id="fullName" {...regContact("fullName")} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
                      {errContact.fullName && <p className="text-red-400 text-xs mt-1">{errContact.fullName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Téléphone</label>
                      <input id="phone" {...regContact("phone")} placeholder="+237 6XX XXX XXX" onChange={e => setContactValue("phone", formatCameroonPhone(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" inputMode="tel" />
                      {errContact.phone && <p className="text-red-400 text-xs mt-1">{errContact.phone.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Email (optionnel)</label>
                      <input id="email" {...regContact("email")} type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
                      {errContact.email && <p className="text-red-400 text-xs mt-1">{errContact.email.message}</p>}
                    </div>
              <div className="flex flex-wrap gap-4 mt-6 mb-4 opacity-80">
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Paiement sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Produits authentiques
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <RefreshCcw className="w-4 h-4 text-emerald-400" /> Retour sous 7 jours
                </div>
              </div>
                    <Button type="submit" className="w-full h-12 font-bold uppercase mt-4">Continuer</Button>
                  </form>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => step > 2 && setStep(2)} className="w-full flex items-center justify-between p-6 bg-white/5" disabled={step < 2}>
                <div className="flex items-center gap-4">
                  <span className={cn("text-xl font-display font-bold", step < 2 && "text-white/30")}>2. Mode de réception</span>
                  {step > 2 && <span className="text-sm text-brand-primary">Modifier</span>}
                </div>
                {step === 2 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-white/30" />}
              </button>

              {step === 2 && (
                <div className="p-6 pt-0">
                  <div className="flex gap-4 mb-6 mt-4">
                    <button onClick={() => setFulfilmentType('delivery')} className={cn("flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors", fulfilmentType === 'delivery' ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-white/10 hover:bg-white/5")}>
                      <MapPin className="w-6 h-6" />
                      <span className="font-bold text-sm">Livraison à domicile</span>
                    </button>
                    <button onClick={() => setFulfilmentType('pickup')} className={cn("flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-colors", fulfilmentType === 'pickup' ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-white/10 hover:bg-white/5")}>
                      <Store className="w-6 h-6" />
                      <span className="font-bold text-sm">Retrait en magasin</span>
                    </button>
                  </div>

                  {fulfilmentType === 'delivery' ? (
                    <form onSubmit={handleDelivery(onFulfilmentSubmit)} className="space-y-4">
                      <div>
                        <label htmlFor="city" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Ville</label>
                        <select id="city" {...regDelivery("city")} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none text-white">
                          <option value="" className="text-black">Sélectionner une ville...</option>
                          <option value="Douala" className="text-black">Douala</option>
                          <option value="Yaoundé" className="text-black">Yaoundé</option>
                        </select>
                        {errDelivery.city && <p className="text-red-400 text-xs mt-1">{errDelivery.city.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="quarter" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Quartier</label>
                        <input id="quarter" {...regDelivery("quarter")} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
                        {errDelivery.quarter && <p className="text-red-400 text-xs mt-1">{errDelivery.quarter.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="landmark" className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-1">Point de repère</label>
                        <input id="landmark" {...regDelivery("landmark")} placeholder="Ex: Face Boulangerie Saker" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
                        {errDelivery.landmark && <p className="text-red-400 text-xs mt-1">{errDelivery.landmark.message}</p>}
                      </div>
              <div className="flex flex-wrap gap-4 mt-6 mb-4 opacity-80">
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Paiement sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Produits authentiques
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <RefreshCcw className="w-4 h-4 text-emerald-400" /> Retour sous 7 jours
                </div>
              </div>
                      <Button type="submit" className="w-full h-12 font-bold uppercase mt-4">Continuer</Button>
                    </form>
                  ) : (
                    <form onSubmit={handlePickup(onFulfilmentSubmit)} className="space-y-4">
                      <div className="space-y-3">
                        {STORES.map(store => (
                          <label key={store.id} className="flex gap-4 p-4 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5">
                            <input type="radio" value={store.id} {...regPickup("storeId")} className="mt-1" />
                            <div>
                              <p className="font-bold">{store.name}</p>
                              <p className="text-sm text-fg-muted">{store.address}, {store.city}</p>
                              <p className="text-xs text-brand-primary mt-1">{store.eta}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errPickup.storeId && <p className="text-red-400 text-xs mt-1">{errPickup.storeId.message}</p>}
              <div className="flex flex-wrap gap-4 mt-6 mb-4 opacity-80">
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Paiement sécurisé
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Produits authentiques
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-fg-muted uppercase tracking-wider">
                  <RefreshCcw className="w-4 h-4 text-emerald-400" /> Retour sous 7 jours
                </div>
              </div>
                      <Button type="submit" className="w-full h-12 font-bold uppercase mt-4">Continuer</Button>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={() => step > 3 && setStep(3)} className="w-full flex items-center justify-between p-6 bg-white/5" disabled={step < 3}>
                <div className="flex items-center gap-4">
                  <span className={cn("text-xl font-display font-bold", step < 3 && "text-white/30")}>3. Paiement</span>
                  {step > 3 && <span className="text-sm text-brand-primary">Modifier</span>}
                </div>
                {step === 3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5 text-white/30" />}
              </button>

              {step === 3 && (
                <div className="p-6 pt-0 space-y-4">
                  <div className="space-y-3 mt-4">
                    <label className={cn("flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors", paymentMethod === 'mtn_momo' ? "border-brand-primary bg-brand-primary/5" : "border-white/10 hover:bg-white/5")}>
                      <input type="radio" name="payment" checked={paymentMethod === 'mtn_momo'} onChange={() => setPaymentMethod('mtn_momo')} className="w-4 h-4" />
                      <span className="font-bold flex-1">MTN Mobile Money</span>
                    </label>

                    <label className={cn("flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors", paymentMethod === 'orange_money' ? "border-[#FF7900] bg-[#FF7900]/5" : "border-white/10 hover:bg-white/5")}>
                      <input type="radio" name="payment" checked={paymentMethod === 'orange_money'} onChange={() => setPaymentMethod('orange_money')} className="w-4 h-4" />
                      <span className="font-bold flex-1">Orange Money</span>
                    </label>

                    <label className={cn("flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors", paymentMethod === 'card' ? "border-white/30 bg-white/5" : "border-white/10 hover:bg-white/5")}>
                      <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4" />
                      <CreditCard className="w-5 h-5 text-fg-muted" />
                      <span className="font-bold flex-1">Carte Bancaire (Visa / Mastercard)</span>
                    </label>

                    {total <= 300000 ? (
                      <label className={cn("flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors", paymentMethod === 'cash_on_delivery' ? "border-white/30 bg-white/5" : "border-white/10 hover:bg-white/5")}>
                        <input type="radio" name="payment" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} className="w-4 h-4" />
                        <Banknote className="w-5 h-5 text-fg-muted" />
                        <span className="font-bold flex-1">Paiement à la livraison</span>
                      </label>
                    ) : (
                      <div className="p-4 border border-white/10 rounded-xl bg-white/5 text-sm text-fg-muted">
                        <p>Pour les commandes supérieures à 300 000 FCFA, un acompte de 50% par Mobile Money est requis. Le paiement à la livraison est désactivé.</p>
                      </div>
                    )}
                  </div>

                  {(paymentMethod === 'mtn_momo' || paymentMethod === 'orange_money') && (
                    <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/10">
                      <label className="block text-xs font-bold text-fg-muted uppercase tracking-widest mb-2">Numéro MoMo</label>
                      <input type="tel" value={momoPhone} onChange={e => setMomoPhone(formatCameroonPhone(e.target.value))} placeholder="+237 6XX XXX XXX" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none text-white mb-2" />
                      <p className="text-xs text-brand-primary flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Vous recevrez une demande de paiement sur votre téléphone</p>
                    </div>
                  )}

                  <Button onClick={() => setStep(4)} className="w-full h-12 font-bold uppercase mt-4">Vérifier la commande</Button>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-6 bg-white/5 cursor-default">
                <div className="flex items-center gap-4">
                  <span className={cn("text-xl font-display font-bold", step < 4 && "text-white/30")}>4. Confirmer</span>
                </div>
              </button>

              {step === 4 && (
                <div className="p-6 pt-0 space-y-6">
                  {errorMessage && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </div>
                  )}

                  {isSubmitting ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                      <p className="font-bold text-lg mb-2">Paiement en cours...</p>
                      <p className="text-sm text-fg-muted">Veuillez valider sur votre téléphone. Ne fermez pas cette page.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 border border-white/10 rounded-xl p-4 bg-black/30 text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-fg-muted">Sous-total ({totalItems} articles)</span>
                          <span className="font-bold">{subtotal} FCFA</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-fg-muted">Frais de livraison</span>
                          <span className="font-bold">{shippingFee === 0 ? 'Gratuit' : `${shippingFee} FCFA`}</span>
                        </div>
                        <div className="flex justify-between text-lg pt-2">
                          <span className="font-bold">Total à payer</span>
                          <span className="font-display font-bold text-brand-primary">{total} FCFA</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="terms" className="rounded bg-black/50 border-white/20 text-brand-primary w-4 h-4" required />
                        <label htmlFor="terms" className="text-xs text-fg-muted">
                          J'accepte les conditions générales de vente et la politique de confidentialité.
                        </label>
                      </div>

                      <Button onClick={placeOrder} disabled={isSubmitting || (['mtn_momo', 'orange_money'].includes(paymentMethod) && !momoPhone)} className="w-full h-14 font-bold text-lg tracking-widest uppercase flex items-center justify-center gap-2">
                        Payer {total} FCFA <ArrowRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="hidden lg:block relative">
            <div className="sticky top-28 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Résumé de la commande</h3>
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-black/50 border border-white/5 p-1 flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-screen" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold line-clamp-2 leading-tight">{item.product.name}</p>
                      <p className="text-fg-muted mt-1">Qté: {item.quantity}</p>
                      <p className="text-brand-primary font-bold mt-1">{item.product.price * item.quantity} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-fg-muted">
                  <span>Sous-total</span>
                  <span>{subtotal} FCFA</span>
                </div>
                <div className="flex justify-between text-fg-muted">
                  <span>Livraison</span>
                  <span>{shippingFee === 0 ? '-' : `${shippingFee} FCFA`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-white pt-2 border-t border-white/10 mt-2">
                  <span>Total</span>
                  <span>{total} FCFA</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
