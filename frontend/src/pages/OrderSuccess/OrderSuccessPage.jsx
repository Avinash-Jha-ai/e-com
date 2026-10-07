import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Package, ArrowRight, Truck } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function OrderSuccessPage() {
  const { orderId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId,
  });

  const order = data?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center space-y-10">
      {/* Animated Checkmark Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-20 h-20 bg-wine/10 text-wine rounded-full flex items-center justify-center mx-auto shadow-subtle border border-wine/20"
      >
        <Check className="w-10 h-10 stroke-[2.5]" />
      </motion.div>

      {/* Editorial Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-3"
      >
        <span className="text-[10px] uppercase tracking-wide-luxury text-gold font-semibold">
          Gratitude & Celebration
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-light">
          Order Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
          Your saree is on its way to becoming part of your story. A confirmation receipt has been sent to your email.
        </p>
      </motion.div>

      {/* Order Info Card */}
      {order && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-cream/40 p-6 sm:p-8 rounded-brand border border-sand/40 text-left space-y-6 max-w-xl mx-auto"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/30 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-luxury text-taupe block">
                Order Identifier
              </span>
              <span className="font-mono text-xs font-semibold text-charcoal">
                #{order._id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-luxury text-taupe block">
                Date Placed
              </span>
              <span className="text-xs font-medium text-charcoal">
                {formatDate(order.createdAt || new Date())}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-luxury text-taupe block mb-1">
                Payment Status
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'wine'}>
                  {order.paymentMethod} • {order.paymentStatus}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-luxury text-taupe block mb-1">
                Total Amount Paid
              </span>
              <span className="font-serif text-lg text-wine font-semibold">
                {formatPrice(order.totalPrice)}
              </span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="pt-4 border-t border-sand/30 text-xs">
              <span className="text-[10px] uppercase tracking-luxury text-taupe block mb-1">
                Delivering To:
              </span>
              <p className="text-charcoal-muted leading-relaxed">
                <strong>{order.shippingAddress.fullName}</strong> ({order.shippingAddress.phone})
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-4 pt-4"
      >
        <Link to={`/account/orders/${orderId}`}>
          <Button variant="primary" size="md" className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="secondary" size="md">
            Continue Shopping
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
