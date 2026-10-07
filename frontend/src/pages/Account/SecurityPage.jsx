import React, { useState } from 'react';
import { Shield, KeyRound } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import { useUI } from '../../context/UIContext';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SecurityPage() {
  const { addToast } = useUI();
  const [step, setStep] = useState('idle'); // 'idle' | 'otp-sent' | 'change'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleRequestOtp = async () => {
    setIsLoading(true);
    setFormError('');
    try {
      const res = await authApi.getPasswordChangeOtp();
      if (res?.success) {
        setStep('otp-sent');
        addToast({ type: 'success', message: 'Password change code sent to your email' });
      }
    } catch (err) {
      setFormError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormError('');

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.changePassword({ otp, newPassword });
      if (res?.success) {
        addToast({ type: 'success', message: 'Password updated successfully' });
        setStep('idle');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setFormError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="border-b border-sand/30 pb-3">
        <h2 className="font-serif text-2xl text-charcoal">Security & Password</h2>
        <p className="text-xs text-taupe mt-1">Manage your account access credentials.</p>
      </div>

      <div className="bg-white p-6 rounded-brand border border-sand/40 space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-wine/10 text-wine flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-luxury font-semibold text-charcoal">Change Password</h3>
            <p className="text-[11px] text-taupe">We'll send a verification code to your registered email.</p>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-wine/10 border border-wine/30 rounded-brand text-xs text-wine">
            {formError}
          </div>
        )}

        {step === 'idle' && (
          <Button variant="primary" size="md" onClick={handleRequestOtp} isLoading={isLoading}>
            Request Password Change Code
          </Button>
        )}

        {(step === 'otp-sent' || step === 'change') && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Verification Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the 6-digit code"
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" onClick={() => { setStep('idle'); setFormError(''); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
