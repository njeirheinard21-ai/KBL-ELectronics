import { useAuthStore } from '../../store/useAuthStore';

export function AccountProfile() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">Profil</h1>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase mb-1">Nom complet</label>
              <input defaultValue={user?.displayName || ''} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-fg-muted uppercase mb-1">Téléphone</label>
              <input defaultValue={user?.phoneNumber || ''} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-fg-muted uppercase mb-1">Email</label>
            <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-fg-muted cursor-not-allowed" />
          </div>
          <button type="button" className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold mt-4 hover:bg-white/20 transition-colors">
            Enregistrer les modifications
          </button>
        </form>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl mt-8">
        <h3 className="font-bold mb-4">Sécurité</h3>
        <button type="button" className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors">
          Modifier le mot de passe
        </button>
      </div>
    </div>
  );
}
