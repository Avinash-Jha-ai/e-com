import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import { ShieldCheck } from 'lucide-react';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const inputRefs = useRef([]);
  const { setUserSession, refreshUser } = useAuth();
  const { addToast } = useUI();
  const navigate = useNavigate();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 5 minute countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatCountdown = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    // Only accept numeric single char
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto move to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setFormError('Please enter all 6 digits of your verification code.');
      return;
    }

    setFormError('');
    setIsLoading(true);

    try {
      const res = await authApi.verifyOtp({ email, otp: fullOtp });

      if (res && res.success) {
        addToast({ type: 'success', message: 'Registration verified successfully!' });
        if (res.user) {
          setUserSession(res.user);
        }
        await refreshUser();

        navigate('/account', { replace: true });
      } else {
        setFormError(res?.message || 'Verification failed');
      }
    } catch (err) {
      setFormError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-start justify-center px-4 pt-8 sm:pt-12 pb-16 bg-ivory">
      <div className="max-w-md w-full bg-cream/30 p-8 sm:p-10 rounded-brand border border-sand/40 space-y-6 text-center">
        {/* Icon & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 bg-wine/10 text-wine rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
            Email Verification
          </span>
          <h1 className="font-serif text-3xl text-charcoal font-light">
            Enter Verification Code
          </h1>
          <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
            We sent a 6-digit code to{' '}
            <strong className="text-charcoal font-medium">{email || 'your email'}</strong>
          </p>
        </div>

        {formError && (
          <div className="p-3 bg-wine/10 border border-wine/30 rounded-brand text-xs text-wine leading-relaxed">
            {formError}
          </div>
        )}

        {/* 6 OTP Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center space-x-2 sm:space-x-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 sm:w-12 h-14 text-center text-xl font-serif font-semibold bg-white border border-sand/60 rounded-brand focus:border-wine focus:ring-1 focus:ring-wine outline-none transition-colors"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Countdown & Resend State */}
          <div className="text-xs text-taupe flex items-center justify-center space-x-2">
            {timeLeft > 0 ? (
              <span>Code expires in <strong className="text-charcoal font-mono">{formatCountdown()}</strong></span>
            ) : (
              <span className="text-wine font-medium">Code expired. Please register again.</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            disabled={otp.join('').length !== 6 || timeLeft <= 0}
            className="w-full"
          >
            Verify & Continue
          </Button>
        </form>

        <div className="pt-2 text-xs text-taupe">
          <Link to="/register" className="text-charcoal hover:text-wine underline">
            Change email or try again
          </Link>
        </div>
      </div>
    </div>
  );
}
