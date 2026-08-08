import { Helmet } from 'react-helmet-async';

export function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ | Jstore</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Questions Fréquentes</h1>
      </div>
    </>
  );
}
