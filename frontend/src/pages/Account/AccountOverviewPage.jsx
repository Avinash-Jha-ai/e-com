import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Heart, MapPin, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/order.api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

export default function AccountOverviewPage() {
  const { user } = useAuth();

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  });

  const orders = ordersData?.orders || [];
  const recentOrders = orders.slice(0, 2);
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-brand border border-sand/40">
        <div className="flex items-center space-x-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border border-sand/60"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-wine/10 text-wine flex items-center justify-center font-serif text-2xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
            </div>
          )}
          <div>
            <h2 className="font-serif text-2xl text-charcoal">{user?.name}</h2>
            <p className="text-xs text-taupe">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="wine">{user?.role || 'Customer'}</Badge>
              {user?.isVerify && <Badge variant="success">Verified Account</Badge>}
            </div>
          </div>
        </div>
        <Link to="/account/profile">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-brand border border-sand/40 space-y-1">
          <span className="text-[10px] uppercase tracking-luxury text-taupe block">
            Total Orders
          </span>
          <span className="font-serif text-3xl text-charcoal">{orders.length}</span>
          <Link
            to="/account/orders"
            className="text-xs text-wine hover:underline block pt-2 font-medium"
          >
            View history →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-brand border border-sand/40 space-y-1">
          <span className="text-[10px] uppercase tracking-luxury text-taupe block">
            Saved Addresses
          </span>
          <span className="font-serif text-3xl text-charcoal">
            {user?.addresses?.length || 0}
          </span>
          <Link
            to="/account/addresses"
            className="text-xs text-wine hover:underline block pt-2 font-medium"
          >
            Manage addresses →
          </Link>
        </div>

        <div className="p-5 bg-white rounded-brand border border-sand/40 space-y-1">
          <span className="text-[10px] uppercase tracking-luxury text-taupe block">
            Member Status
          </span>
          <span className="font-serif text-xl text-wine font-medium">Boutique Patron</span>
          <p className="text-[10px] text-taupe pt-2">Complimentary express shipping</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-charcoal">Recent Orders</h3>
          <Link
            to="/account/orders"
            className="text-xs text-wine hover:underline uppercase tracking-luxury font-medium"
          >
            View All ({orders.length})
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 bg-white rounded-brand border border-sand/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold text-charcoal">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <Badge variant={order.orderStatus === 'CONFIRMED' ? 'success' : 'neutral'}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-taupe mt-1">
                    Placed on {formatDate(order.createdAt)} • {order.items?.length || 1} items
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="font-serif text-base font-semibold text-wine">
                    {formatPrice(order.totalPrice)}
                  </span>
                  <Link to={`/account/orders/${order._id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-brand border border-sand/40 text-center space-y-3">
            <p className="text-xs text-taupe">You haven’t placed any orders yet.</p>
            <Link to="/shop">
              <Button variant="primary" size="sm">
                Explore The Collection
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Default Address Snapshot */}
      {defaultAddress && (
        <div className="p-5 bg-white rounded-brand border border-sand/40 space-y-2">
          <div className="flex items-center justify-between border-b border-sand/30 pb-2">
            <span className="text-xs font-semibold uppercase tracking-luxury text-charcoal">
              Default Delivery Address
            </span>
            <Link to="/account/addresses" className="text-xs text-wine hover:underline font-medium">
              Edit
            </Link>
          </div>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            <strong>{defaultAddress.fullName}</strong> ({defaultAddress.phone})
            <br />
            {defaultAddress.addressLine1}
            {defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ''}
            <br />
            {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
          </p>
        </div>
      )}
    </div>
  );
}
