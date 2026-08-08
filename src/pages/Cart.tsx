import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function Cart() {
  return (
    <>
      <Helmet>
        <title>Mon Panier | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mon Panier</h1>
        <p className="text-fg-muted mb-4">Votre panier est vide.</p>
        <Link to="/" className="text-brand-primary font-medium hover:underline">
          Continuer vos achats
        </Link>
      </div>
    </>
  );
}
