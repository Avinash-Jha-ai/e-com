import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { setUserSession, refreshUser } = useAuth();
  const { addToast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });

      if (res && res.success) {
        addToast({ type: 'success', message: 'Welcome back' });
        if (res.user) {
          setUserSession(res.user);
        }
        await refreshUser();
        navigate(redirectPath, { replace: true });
      } else {
        setFormError(res?.message || 'Login failed');
      }
    } catch (err) {
      setFormError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100svh-8rem)] grid grid-cols-1 bg-ivory lg:grid-cols-2">
      {/* Editorial image */}
      <div className="hidden lg:block relative overflow-hidden bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
          alt="Vanya Editorial Login"
          className="w-full h-full object-cover object-center brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/30" />
        <div className="absolute bottom-10 left-10 right-10 space-y-3 text-ivory xl:bottom-12 xl:left-12 xl:right-12">
          <span className="text-[10px] uppercase tracking-wide-luxury text-gold font-semibold">
            Member Access
          </span>
          <h2 className="font-serif text-3xl font-light leading-tight text-cream">
            Step Into Your Private Atelier
          </h2>
          <p className="text-xs text-ivory/80 max-w-md font-light leading-relaxed">
            Access your curated saved edit, personalized order tracking, and bespoke handloom recommendations.
          </p>
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex min-h-[calc(100svh-8rem)] items-start justify-center border-sand/30 px-5 pb-14 pt-16 sm:px-10 sm:pb-16 sm:pt-20 lg:border-l lg:px-16 lg:pt-24 xl:px-24">
        <div className="w-full max-w-[29rem] space-y-8 sm:space-y-10">
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
              Member Sign In
            </span>
            <h1 className="font-serif text-4xl font-light leading-none text-charcoal sm:text-5xl">
              Welcome Back
            </h1>
            <p className="max-w-sm text-xs leading-relaxed text-charcoal-muted sm:text-sm">
              Enter your credentials to manage your orders and saved drapes.
            </p>
          </div>

          {formError && (
            <div className="rounded-brand border border-wine/30 bg-wine/10 p-4 text-xs leading-relaxed text-wine">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="mt-2 w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="border-t border-sand/40 pt-6 text-center text-xs leading-relaxed text-taupe">
            <p>
              Don’t have a Vanya account?{' '}
              <Link to="/register" className="text-wine font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
