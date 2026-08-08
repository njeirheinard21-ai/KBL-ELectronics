import { Helmet } from 'react-helmet-async';

export function Products() {
  return (
    <>
      <Helmet>
        <title>Tous les Produits | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Tous les Produits</h1>
      </div>
    </>
  );
}
