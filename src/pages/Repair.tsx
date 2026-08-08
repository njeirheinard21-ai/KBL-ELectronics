import { Helmet } from 'react-helmet-async';

export function Repair() {
  return (
    <>
      <Helmet>
        <title>Services de Réparation | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Services de Réparation</h1>
      </div>
    </>
  );
}
