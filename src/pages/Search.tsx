import { Helmet } from 'react-helmet-async';

export function Search() {
  return (
    <>
      <Helmet>
        <title>Recherche | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Résultats de recherche</h1>
        <p className="text-fg-muted">Aucun résultat trouvé.</p>
      </div>
    </>
  );
}
