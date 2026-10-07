import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Package, Truck, MapPin, CreditCard } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import { formatPrice, formatDate, getProductFrontImage } from '../../utils/formatters';
import { formatErrorMessage } from '../../utils/errorHelpers';
import { useUI } from '../../context/UIContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const TIMELINE_STAGES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const STAGE_ICONS = {
  PENDING: Package,
  CONFIRMED: Check,
  SHIPPED: Truck,
  DELIVERED: MapPin,
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { addToast } = useUI();
  const queryClient = useQueryClient();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId,
  });

  const { data: trackingData } = useQuery({
    queryKey: ['orderTracking', orderId],
    queryFn: () => orderApi.getOrderTracking(orderId),
    enabled: !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({ type: 'success', message: 'Order cancelled successfully' });
    },
    onError: (err) => {
      addToast({ type: 'error', message: formatErrorMessage(err) });
    },
  });

  const order = orderData?.order;
  const tracking = trackingData?.tracking || trackingData?.history || [];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="w-40 h-5 bg-sand/40 rounded-brand" />
        <div className="w-full h-24 bg-cream rounded-brand" />
        <div className="w-full h-40 bg-cream rounded-brand" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center space-y-3">
        <h3 className="font-serif text-2xl text-charcoal">Order Not Found</h3>
        <Link to="/account/orders">
          <Button variant="secondary" size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const currentStageIndex = TIMELINE_STAGES.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';
  const isTerminal = isCancelled || order.orderStatus === 'DELIVERED';
  const canCancel = !isTerminal && currentStageIndex < 2;
  const items = order.items || [];

  return (
    <div className="space-y-8">
      {/* Back + Title */}
      <div className="flex items-center space-x-3">
        <Link to="/account/orders" className="text-taupe hover:text-wine transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="font-serif text-2xl text-charcoal">
            Order #{order._id.slice(-8).toUpperCase()}
          </h2>
          <p className="text-[11px] text-taupe">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={isCancelled ? 'neutral' : 'success'}>{order.orderStatus}</Badge>
        <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'wine'}>
          {order.paymentMethod} • {order.paymentStatus}
        </Badge>
      </div>

      {/* Timeline Tracker */}
      {!isCancelled && (
        <div className="bg-white p-6 rounded-brand border border-sand/40">
          <h3 className="text-xs uppercase tracking-luxury font-semibold text-charcoal mb-6">
            Order Timeline
          </h3>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden sm:flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-8 right-8 h-[2px] bg-sand/40">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${Math.max(0, (currentStageIndex / (TIMELINE_STAGES.length - 1)) * 100)}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-wine"
              />
            </div>

            {TIMELINE_STAGES.map((stage, idx) => {
              const Icon = STAGE_ICONS[stage];
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const trackEntry = tracking.find((t) => t.status === stage);

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
                  className="relative z-10 flex flex-col items-center text-center w-1/4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-wine border-wine text-ivory'
                        : 'bg-cream border-sand/60 text-taupe'
                    } ${isCurrent ? 'ring-4 ring-wine/20' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] uppercase tracking-luxury mt-2 font-medium ${
                    isCompleted ? 'text-charcoal' : 'text-taupe'
                  }`}>
                    {stage}
                  </span>
                  {trackEntry && (
                    <span className="text-[10px] text-taupe mt-0.5">
                      {formatDate(trackEntry.date || trackEntry.timestamp)}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="sm:hidden space-y-4">
            {TIMELINE_STAGES.map((stage, idx) => {
              const Icon = STAGE_ICONS[stage];
              const isCompleted = idx <= currentStageIndex;
              const trackEntry = tracking.find((t) => t.status === stage);

              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-wine border-wine text-ivory' : 'bg-cream border-sand/60 text-taupe'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {idx < TIMELINE_STAGES.length - 1 && (
                      <div className={`w-[2px] h-6 ${isCompleted ? 'bg-wine' : 'bg-sand/40'}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <span className={`text-xs font-medium ${isCompleted ? 'text-charcoal' : 'text-taupe'}`}>
                      {stage}
                    </span>
                    {trackEntry && (
                      <>
                        {trackEntry.message && <p className="text-[11px] text-taupe">{trackEntry.message}</p>}
                        <p className="text-[10px] text-taupe">{formatDate(trackEntry.date || trackEntry.timestamp)}</p>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-cream/50 p-5 rounded-brand border border-sand/40 text-center">
          <p className="font-serif text-xl text-charcoal">This order has been cancelled.</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white p-6 rounded-brand border border-sand/40 space-y-4">
        <h3 className="text-xs uppercase tracking-luxury font-semibold text-charcoal border-b border-sand/30 pb-3">
          Order Items ({items.length})
        </h3>
        <div className="divide-y divide-sand/30">
          {items.map((item, idx) => {
            const product = item.product || {};
            const imgUrl = getProductFrontImage(product.images, idx);
            return (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex space-x-4">
                <div className="w-16 h-20 bg-cream rounded-brand overflow-hidden border border-sand/30 shrink-0">
                  <img src={imgUrl} alt={product.title || 'Product'} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-charcoal">{product.title || 'Saree'}</p>
                  <p className="text-[11px] text-taupe">Qty: {item.quantity}</p>
                  <p className="text-xs font-semibold text-wine mt-1">{formatPrice(item.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Address */}
        {order.shippingAddress && (
          <div className="bg-white p-5 rounded-brand border border-sand/40 space-y-2">
            <h4 className="text-[11px] uppercase tracking-luxury font-semibold text-charcoal">
              Delivery Address
            </h4>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              <strong>{order.shippingAddress.fullName}</strong><br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-brand border border-sand/40 space-y-2">
          <h4 className="text-[11px] uppercase tracking-luxury font-semibold text-charcoal">
            Payment Summary
          </h4>
          <div className="text-xs space-y-1">
            <div className="flex justify-between"><span className="text-taupe">Total</span><span className="font-serif text-lg text-wine font-semibold">{formatPrice(order.totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-taupe">Method</span><span>{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-taupe">Status</span><span>{order.paymentStatus}</span></div>
          </div>
        </div>
      </div>

      {/* Cancel Order Action */}
      {canCancel && (
        <div className="pt-4 border-t border-sand/40 text-right">
          <Button
            variant="outline"
            size="sm"
            isLoading={cancelMutation.isPending}
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this order?')) {
                cancelMutation.mutate();
              }
            }}
            className="text-wine border-wine/40"
          >
            Cancel Order
          </Button>
        </div>
      )}
    </div>
  );
}
