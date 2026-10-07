import React, { useState } from 'react';
import { MapPin, Plus, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function AddressesPage() {
  const { user, updateAddresses } = useAuth();
  const { addToast } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const addresses = user?.addresses || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authApi.addAddress(newAddress);
      if (res?.success && res.addresses) {
        updateAddresses(res.addresses);
        setShowForm(false);
        setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
        addToast({ type: 'success', message: 'Address saved' });
      }
    } catch (err) {
      addToast({ type: 'error', message: formatErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this saved address?')) return;

    setDeletingAddressId(addressId);
    try {
      const res = await authApi.deleteAddress(addressId);
      if (res?.success && res.addresses) {
        updateAddresses(res.addresses);
        addToast({ type: 'success', message: 'Address deleted' });
      }
    } catch (err) {
      addToast({ type: 'error', message: formatErrorMessage(err) });
    } finally {
      setDeletingAddressId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-sand/30 pb-3">
        <h2 className="font-serif text-2xl text-charcoal">Saved Addresses</h2>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5" /><span>Add Address</span>
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-brand border border-sand/40 space-y-4">
          <h3 className="text-xs uppercase tracking-luxury font-semibold text-charcoal">New Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
            <Input label="Phone" type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} required />
          </div>
          <Input label="Address Line 1" value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} required />
          <Input label="Address Line 2" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
            <Input label="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} required />
            <Input label="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} required />
          </div>
          <label className="flex items-center space-x-2 text-xs">
            <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} className="accent-wine" />
            <span>Set as default address</span>
          </label>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>Save Address</Button>
          </div>
        </form>
      )}

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="p-5 bg-white rounded-brand border border-sand/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-wine" />
                  <span className="text-xs font-semibold text-charcoal">{addr.fullName}</span>
                </div>
                {addr.isDefault && (
                  <span className="text-[9px] uppercase tracking-luxury bg-wine/10 text-wine px-2 py-0.5 rounded-brand font-semibold flex items-center space-x-1">
                    <Check className="w-2.5 h-2.5" /><span>Default</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                {addr.city}, {addr.state} - {addr.postalCode}<br />
                Phone: {addr.phone}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(addr._id)}
                isLoading={deletingAddressId === addr._id}
                disabled={deletingAddressId !== null}
                className="flex items-center space-x-1 text-wine hover:text-burgundy"
                aria-label={`Delete address for ${addr.fullName}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <div className="py-12 text-center text-xs text-taupe">
          <MapPin className="w-8 h-8 mx-auto text-taupe mb-3 stroke-[1.5]" />
          <p>No saved addresses yet. Add one for faster checkout.</p>
        </div>
      ) : null}
    </div>
  );
}
