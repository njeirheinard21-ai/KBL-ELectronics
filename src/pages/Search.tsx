import { Helmet } from 'react-helmet-async';
import { SEO } from '../components/SEO';

import { useLocation } from 'react-router-dom';

export function Search() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  return (
    <>
      <Helmet>
        <title>Recherche | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
      <SEO 
        title={`Search: ${searchQuery}`} 
      />
        <h1 className="text-3xl font-bold mb-6">Résultats de recherche</h1>
        <p className="text-fg-muted">Aucun résultat trouvé pour "{searchQuery}".</p>
      </div>
    </>
  );
}