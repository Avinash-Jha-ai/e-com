import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Truck, Plus, CheckCircle, CreditCard, Banknote, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useUI } from '../../context/UIContext';
import { authApi } from '../../api/auth.api';
import { orderApi } from '../../api/order.api';
import { paymentApi } from '../../api/payment.api';
import { formatPrice, getProductFrontImage } from '../../utils/formatters';
import { formatErrorMessage } from '../../utils/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function CheckoutPage() {
  const { user, isAuthenticated, refreshUser, updateAddresses } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const { addToast } = useUI();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Address selection state
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'ONLINE'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const savedAddresses = user?.addresses || [];

  // Default address selection on mount
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(defaultAddr._id);
    } else if (savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses, selectedAddressId]);

  const items = cart?.items || [];
  const qualifiesForFreeShipping = totalPrice >= 1999;
  const shippingFee = qualifiesForFreeShipping ? 0 : 150;
  const grandTotal = totalPrice + shippingFee;

  // Add new address handler
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await authApi.addAddress(newAddress);
      if (res && res.success && res.addresses) {
        updateAddresses(res.addresses);
        const added = res.addresses[res.addresses.length - 1];
        if (added) setSelectedAddressId(added._id);
        setShowNewAddressForm(false);
        addToast({ type: 'success', message: 'Address saved to profile' });
      }
    } catch (err) {
      setErrorMessage(formatErrorMessage(err));
    }
  };

  // Place Order handler (COD or Razorpay Online)
  const handlePlaceOrder = async () => {
    setErrorMessage('');

    if (!selectedAddressId) {
      setErrorMessage('Please select or add a shipping address before proceeding.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your bag is empty. Please add sarees to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on backend
      const orderRes = await orderApi.createOrder({
        addressId: selectedAddressId,
        paymentMethod,
      });

      if (!orderRes || !orderRes.success || !orderRes.order) {
        throw new Error(orderRes?.message || 'Failed to initialize order');
      }

      const createdOrder = orderRes.order;
      const orderId = createdOrder._id;

      // 2A. If Cash on Delivery (COD) -> Order confirmed immediately
      if (paymentMethod === 'COD') {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        addToast({ type: 'success', message: 'Order placed successfully' });
        navigate(`/order-success/${orderId}`, { replace: true });
        return;
      }

      // 2B. If Online Payment -> Razorpay Flow
      if (paymentMethod === 'ONLINE') {
        const paymentRes = await paymentApi.createPayment(orderId);

        if (!paymentRes || !paymentRes.success) {
          throw new Error(paymentRes?.message || 'Could not initiate Razorpay payment order');
        }

        const { key, razorpayOrderId, amount, currency } = paymentRes;

        // Check if Razorpay script is loaded
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        const options = {
          key: key,
          amount: amount,
          currency: currency || 'INR',
          name: 'VANYA ATELIER',
          description: `Handcrafted Saree Order #${orderId.slice(-6).toUpperCase()}`,
          order_id: razorpayOrderId,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: savedAddresses.find((a) => a._id === selectedAddressId)?.phone || '',
          },
          theme: {
            color: '#651F2B',
          },
          handler: async function (response) {
            try {
              setIsSubmitting(true);
              // Verify payment with backend
              const verifyRes = await paymentApi.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes && verifyRes.success) {
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                queryClient.invalidateQueries({ queryKey: ['orders'] });
                addToast({ type: 'success', message: 'Payment verified & order confirmed!' });
                navigate(`/order-success/${orderId}`, { replace: true });
              } else {
                setErrorMessage('Payment verification failed on server.');
              }
            } catch (err) {
              setErrorMessage(formatErrorMessage(err));
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              addToast({ type: 'info', message: 'Payment cancelled. Your order is pending in Orders.' });
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setErrorMessage(formatErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-charcoal">Sign In to Checkout</h2>
        <p className="text-xs text-taupe leading-relaxed">
          Please log in to your account or register to complete your order with saved addresses and live tracking.
        </p>
        <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
          <Button variant="primary" size="lg" className="w-full">
            Sign In to Continue
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-charcoal">Your Bag is Empty</h2>
        <p className="text-xs text-taupe">Please add at least one saree before checking out.</p>
        <Link to="/shop">
          <Button variant="primary" size="md">
            Explore Sarees
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12">
      {/* Title */}
      <div className="border-b border-sand/40 pb-6">
        <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
          Final Step
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
          Secure Checkout
        </h1>
      </div>

      {errorMessage && (
        <div className="p-4 bg-wine/10 border border-wine/30 rounded-brand text-xs text-wine leading-relaxed">
          {errorMessage}
        </div>
      )}

      {/* 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: 01 Address & 02 Payment */}
        <div className="lg:col-span-7 space-y-10">
          {/* 01 ADDRESS SECTION */}
          <section className="space-y-5 bg-cream/20 p-6 sm:p-8 rounded-brand border border-sand/40">
            <div className="flex items-center justify-between border-b border-sand/30 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-full bg-wine text-ivory text-xs font-serif flex items-center justify-center font-bold">
                  1
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-normal">
                  Delivery Address
                </h2>
              </div>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs text-wine hover:underline uppercase tracking-luxury font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Address</span>
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {!showNewAddressForm && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id;
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-brand border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-wine bg-white shadow-subtle'
                          : 'border-sand/50 bg-cream/40 hover:border-sand'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-xs text-charcoal">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] uppercase tracking-luxury bg-sand/30 text-charcoal px-1.5 py-0.5 rounded-brand">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-muted leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        <br />
                        {addr.city}, {addr.state} - {addr.postalCode}
                        <br />
                        Phone: {addr.phone}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleAddNewAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+919876543210"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    required
                  />
                </div>

                <Input
                  label="Address Line 1"
                  placeholder="House / Flat No., Building Name, Street"
                  value={newAddress.addressLine1}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                  required
                />

                <Input
                  label="Address Line 2 (Optional)"
                  placeholder="Landmark, Area, Apartment Details"
                  value={newAddress.addressLine2}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                  <Input
                    label="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                  />
                  <Input
                    label="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  {savedAddresses.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" variant="primary" size="sm">
                    Save Address
                  </Button>
                </div>
              </form>
            )}
          </section>

          {/* 02 PAYMENT METHOD */}
          <section className="space-y-5 bg-cream/20 p-6 sm:p-8 rounded-brand border border-sand/40">
            <div className="flex items-center space-x-3 border-b border-sand/30 pb-4">
              <span className="w-6 h-6 rounded-full bg-wine text-ivory text-xs font-serif flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-charcoal font-normal">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash on Delivery */}
              <label
                className={`p-5 rounded-brand border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'COD'
                    ? 'border-wine bg-white shadow-subtle'
                    : 'border-sand/50 bg-cream/40 hover:border-sand'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <Banknote className="w-5 h-5 text-wine" />
                    <span className="font-medium text-xs text-charcoal">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-wine w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-taupe leading-relaxed">
                  Pay with cash or UPI at your doorstep upon receiving your package.
                </p>
              </label>

              {/* Online Payment (Razorpay) */}
              <label
                className={`p-5 rounded-brand border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-wine bg-white shadow-subtle'
                    : 'border-sand/50 bg-cream/40 hover:border-sand'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-5 h-5 text-wine" />
                    <span className="font-medium text-xs text-charcoal">
                      Online Payment (Razorpay)
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="accent-wine w-4 h-4"
                  />
                </div>
                <p className="text-[11px] text-taupe leading-relaxed">
                  UPI, Credit / Debit Cards, Netbanking & Wallets secured via Razorpay.
                </p>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Review & CTAs */}
        <div className="lg:col-span-5 bg-cream/40 p-6 sm:p-8 rounded-brand border border-sand/40 space-y-6 lg:sticky lg:top-28">
          <h3 className="font-serif text-2xl text-charcoal font-normal border-b border-sand/30 pb-4">
            Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          {/* Mini Items List */}
          <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-sand/30 pr-1">
            {items.map((item) => {
              const product = item.product || {};
              const imageUrl = getProductFrontImage(product.images);
              return (
                <div key={item._id || product._id} className="pt-3 first:pt-0 flex items-center space-x-3">
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-12 h-15 object-cover rounded-brand bg-cream border border-sand/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal truncate">
                      {product.title}
                    </p>
                    <p className="text-[11px] text-taupe">
                      Qty: {item.quantity} × {formatPrice(item.price || product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-wine shrink-0">
                    {formatPrice((item.price || product.price) * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2.5 text-xs text-charcoal pt-4 border-t border-sand/40">
            <div className="flex justify-between">
              <span className="text-taupe">Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-taupe">Express Shipping</span>
              <span className="font-medium text-emerald-800">
                {qualifiesForFreeShipping ? 'FREE' : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-3 border-t border-sand/40">
              <span className="font-serif text-lg">Total Amount</span>
              <span className="text-wine font-serif text-xl">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>

          {/* Final Submit Button */}
          <Button
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            onClick={handlePlaceOrder}
            className="w-full flex items-center justify-center space-x-2"
          >
            <span>
              {paymentMethod === 'ONLINE' ? `Pay ${formatPrice(grandTotal)} with Razorpay` : `Place Order (${formatPrice(grandTotal)})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center pt-2">
            <p className="text-[11px] text-taupe flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-wine" />
              <span>Encrypted Bank-Grade 256-Bit SSL Checkout</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
