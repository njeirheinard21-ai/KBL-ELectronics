import { Helmet } from 'react-helmet-async';

export function UsersAdmin() {
  return (
    <>
      <Helmet>
        <title>Gestion des Utilisateurs | Admin</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Utilisateurs</h1>
      </div>
    </>
  );
}
