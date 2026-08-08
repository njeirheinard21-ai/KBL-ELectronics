import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-display font-bold text-white">404</h1>
        <h2 className="text-2xl font-display text-white">Page Not Found</h2>
        <p className="text-fg-muted max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="mt-8 font-bold uppercase tracking-widest rounded-full px-8 h-12">
          <Link to="/">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};
