import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useUI();
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Choose a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Profile image must be 5MB or smaller');
      event.target.value = '';
      return;
    }

    setFormError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setFormError('Name must be between 2 and 80 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await authApi.updateProfile(formData);
      if (!res?.success || !res.user) {
        setFormError(res?.message || 'Profile update failed');
        return;
      }

      updateProfile(res.user);
      setName(res.user.name);
      setAvatarFile(null);
      addToast({ type: 'success', message: 'Profile updated successfully' });
    } catch (error) {
      setFormError(formatErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-sand/30 pb-3">
        <h2 className="font-serif text-2xl text-charcoal">Your Profile</h2>
        <p className="text-xs text-taupe mt-1">Update your name and profile photo.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-brand border border-sand/40 space-y-5"
      >
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-sand/60"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-wine/10 text-wine flex items-center justify-center font-serif text-2xl font-bold">
              {name.trim().charAt(0).toUpperCase() || 'V'}
            </div>
          )}
          <div className="space-y-1">
            <label
              htmlFor="profile-avatar"
              className="text-xs font-medium text-wine hover:text-burgundy cursor-pointer"
            >
              Change photo
            </label>
            <input
              id="profile-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-[11px] text-taupe file:mr-2 file:rounded-brand file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-xs file:text-charcoal"
            />
            <p className="text-[10px] text-taupe">Image files up to 5MB</p>
          </div>
        </div>

        <Input
          label="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={80}
          autoComplete="name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={user?.email || ''}
          disabled
          autoComplete="email"
        />
        <p className="text-[11px] text-taupe -mt-3">
          Email address cannot be changed here.
        </p>

        {formError && (
          <div className="p-3 bg-wine/10 border border-wine/30 rounded-brand text-xs text-wine">
            {formError}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
