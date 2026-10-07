import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <span className="font-serif text-8xl sm:text-9xl text-wine/20 font-light tracking-tight block">
          404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light -mt-8">
          Looks like this drape slipped away
        </h1>
        <p className="text-xs text-taupe leading-relaxed max-w-sm mx-auto">
          The page you're looking for has either been moved, retired from our collection, or never existed. Let's get you back to browsing beautiful sarees.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="md">Return Home</Button>
          </Link>
          <Link to="/shop">
            <Button variant="secondary" size="md">Browse Sarees</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
