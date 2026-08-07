'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers,
  ShoppingCart, 
  CreditCard,
  Users, 
  Flame,
  BarChart3, 
  Settings, 
  LogOut,
  Wrench
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logoutAdmin, orders = [] } = useStore();

  const pendingCount = orders.filter(o => o.paymentStatus === 'Verification Pending' || o.paymentStatus === 'Screenshot Required').length;

  useEffect(() => {
    const saved = localStorage.getItem('hc_dtf_admin_session');
    if (!adminUser && !saved) {
      router.push('/admin-login');
    }
  }, [adminUser, router]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Products', icon: Package, href: '/admin/products' },
    { label: 'Categories Taxonomy', icon: Layers, href: '/admin/categories' },
    { label: 'Orders & Logistics', icon: ShoppingCart, href: '/admin/orders' },
    { label: `Payment Verifications ${pendingCount > 0 ? `(${pendingCount})` : ''}`, icon: CreditCard, href: '/admin/payments', badge: pendingCount },
    { label: 'Customers', icon: Users, href: '/admin/customers' },
    { label: 'Machines Manager', icon: Wrench, href: '/admin/machines' },
    { label: 'Flash Sale Manager', icon: Flame, href: '/admin/flash-sale' },
    { label: 'Analytics Reports', icon: BarChart3, href: '/admin/reports' },
    { label: 'Store Settings', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center font-extrabold text-white text-base shadow-md">
              HC
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight">HC DTF Admin</h2>
              <p className="text-[10px] text-emerald-400 font-bold uppercase">Control Hub</p>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-3 rounded-2xl transition ${
                    isActive 
                      ? 'bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-600/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && !isActive && (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => {
              logoutAdmin();
              router.push('/admin-login');
            }}
            className="w-full p-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2 transition"
          >
            <LogOut size={16} />
            <span>Logout Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
