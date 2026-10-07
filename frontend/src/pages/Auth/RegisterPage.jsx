import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Upload, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { addToast } = useUI();
  const navigate = useNavigate();

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({ type: 'error', message: 'Avatar must be 5MB or smaller' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isPasswordValid) {
      setFormError('Please fulfill all password requirements below.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('password', password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await authApi.register(formData);

      if (res && res.success) {
        addToast({ type: 'success', message: 'Verification code sent to your email.' });
        navigate(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        setFormError(res?.message || 'Registration failed');
      }
    } catch (err) {
      setFormError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100svh-8rem)] grid grid-cols-1 lg:grid-cols-12 bg-ivory">
      {/* LEFT: Image (Desktop) */}
      <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85"
          alt="Vanya Registration"
          className="w-full h-full object-cover object-center brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/30" />
        <div className="absolute bottom-12 left-12 right-12 text-ivory space-y-2">
          <span className="text-[10px] uppercase tracking-wide-luxury text-gold font-semibold">
            Join Vanya
          </span>
          <h2 className="font-serif text-3xl font-light text-cream">
            The World of Handcrafted Drapes
          </h2>
          <p className="text-xs text-ivory/80 max-w-md font-light leading-relaxed">
            Create an account for expedited checkout, heirloom care guides, and exclusive seasonal invitations.
          </p>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="lg:col-span-7 flex items-start justify-center px-6 pt-6 pb-12 sm:px-12 lg:px-16 lg:pt-8 lg:pb-14">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
              New Member
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light">
              Create Your Account
            </h1>
            <p className="text-xs text-charcoal-muted">
              We'll send a 6-digit verification code to your email.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-wine/10 border border-wine/30 rounded-brand text-xs text-wine leading-relaxed">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Optional Avatar Upload */}
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-luxury text-charcoal-muted font-medium">
                Profile Avatar (Optional)
              </label>
              <div className="flex items-center space-x-4">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-12 h-12 rounded-full object-cover border border-sand"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cream border border-sand/60 flex items-center justify-center text-taupe">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
                <label className="cursor-pointer text-xs font-medium text-wine hover:underline uppercase tracking-luxury">
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radhika Sharma"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="radhika@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars with mixed cases & symbol"
              required
            />

            {/* Password Validation Checklist */}
            <div className="bg-cream/40 p-3 rounded-brand border border-sand/40 space-y-1 text-[11px] text-charcoal-muted">
              <span className="font-semibold block text-[10px] uppercase tracking-luxury text-charcoal">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-taupe'}`}>
                  {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasUppercase ? 'text-emerald-700' : 'text-taupe'}`}>
                  {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Uppercase letter</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasLowercase ? 'text-emerald-700' : 'text-taupe'}`}>
                  {hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Lowercase letter</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-700' : 'text-taupe'}`}>
                  {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>At least 1 digit</span>
                </div>
                <div className={`flex items-center space-x-1.5 ${hasSymbol ? 'text-emerald-700' : 'text-taupe'}`}>
                  {hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>Special symbol</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-3"
            >
              Continue to Verification
            </Button>
          </form>

          <div className="pt-4 border-t border-sand/40 text-center text-xs text-taupe">
            <p>
              Already a member?{' '}
              <Link to="/login" className="text-wine font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
