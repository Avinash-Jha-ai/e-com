import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-wine border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-luxury text-taupe">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-wine/10 text-wine flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl text-charcoal mb-2">
          Access Restricted
        </h2>
        <p className="text-xs text-taupe max-w-md mb-8 leading-relaxed">
          You don't have permission to access this area. This section is restricted to {allowedRoles.join(' or ')} accounts.
        </p>
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Boutique
          </Button>
        </Link>
      </div>
    );
  }

  return children;
}
