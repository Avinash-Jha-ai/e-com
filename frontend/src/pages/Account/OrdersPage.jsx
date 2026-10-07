import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowRight } from 'lucide-react';
import { orderApi } from '../../api/order.api';
import { formatPrice, formatDate, getProductFrontImage } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const STATUS_BADGE = {
  PENDING: 'wine',
  CONFIRMED: 'success',
  SHIPPED: 'gold',
  DELIVERED: 'success',
  CANCELLED: 'neutral',
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const orders = data?.orders || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse p-5 bg-white rounded-brand border border-sand/40">
            <div className="flex gap-4">
              <div className="w-20 h-24 bg-cream rounded-brand" />
              <div className="flex-1 space-y-3">
                <div className="w-40 h-4 bg-sand/40 rounded-brand" />
                <div className="w-24 h-3 bg-sand/30 rounded-brand" />
                <div className="w-20 h-5 bg-sand/50 rounded-brand" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-taupe">
          <Package className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="font-serif text-2xl text-charcoal">No Orders Yet</h3>
        <p className="text-xs text-taupe max-w-sm mx-auto">
          Once you place your first saree order, it will appear here with full tracking details.
        </p>
        <Link to="/shop">
          <Button variant="primary" size="md">Explore Sarees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-sand/30 pb-3">
        <h2 className="font-serif text-2xl text-charcoal">Order History</h2>
        <span className="text-xs text-taupe">{orders.length} orders</span>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const items = order.items || [];
          return (
            <div
              key={order._id}
              className="p-5 bg-white rounded-brand border border-sand/40 hover:border-sand transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-charcoal">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <Badge variant={STATUS_BADGE[order.orderStatus] || 'neutral'}>
                      {order.orderStatus}
                    </Badge>
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'wine'}>
                      {order.paymentMethod} • {order.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-taupe">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-serif text-lg font-semibold text-wine">
                    {formatPrice(order.totalPrice)}
                  </span>
                  <Link to={`/account/orders/${order._id}`}>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <span>View Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Product thumbnails row */}
              {items.length > 0 && (
                <div className="flex space-x-2 pt-3 border-t border-sand/30">
                  {items.slice(0, 4).map((item, idx) => {
                    const product = item.product || {};
                    const imgUrl = getProductFrontImage(product.images, idx);
                    return (
                      <div
                        key={idx}
                        className="w-14 h-18 bg-cream rounded-brand overflow-hidden border border-sand/30 shrink-0"
                      >
                        <img src={imgUrl} alt={product.title || 'Product'} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                  {items.length > 4 && (
                    <div className="w-14 h-18 bg-cream rounded-brand border border-sand/30 flex items-center justify-center text-xs text-taupe font-medium">
                      +{items.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
