import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, UserRound, Package, Heart, MapPin, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useUI();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    addToast({ type: 'info', message: 'Signed out successfully' });
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', to: '/account', end: true, icon: User },
    { name: 'Profile', to: '/account/profile', icon: UserRound },
    { name: 'My Orders', to: '/account/orders', icon: Package },
    { name: 'Saved Wishlist', to: '/wishlist', icon: Heart },
    { name: 'Saved Addresses', to: '/account/addresses', icon: MapPin },
    { name: 'Security & Password', to: '/account/security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-8">
      {/* Account Top Header */}
      <div className="border-b border-sand/40 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wide-luxury text-wine font-semibold">
            Member Sanctuary
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-light mt-1">
            Namaste, {user?.name || 'Customer'}
          </h1>
        </div>

      </div>

      {/* 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-cream/30 p-4 sm:p-5 rounded-brand border border-sand/40 space-y-1">
          <div className="px-3 py-2 mb-2 border-b border-sand/30">
            <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
            <p className="text-[11px] text-taupe truncate">{user?.email}</p>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-brand text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-wine text-ivory shadow-xs font-semibold'
                        : 'text-charcoal-muted hover:text-charcoal hover:bg-sand/20'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-brand text-xs font-medium text-wine hover:bg-wine/10 transition-colors text-left pt-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Right Main Panel */}
        <main className="lg:col-span-9 bg-cream/20 p-6 sm:p-8 rounded-brand border border-sand/40 min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
