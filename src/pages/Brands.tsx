import { Helmet } from 'react-helmet-async';

export function Brands() {
  return (
    <>
      <Helmet>
        <title>Nos Marques | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Nos Marques</h1>
      </div>
    </>
  );
}
