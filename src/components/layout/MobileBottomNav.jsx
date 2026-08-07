'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Heart, Package, User } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlist = [], cart = [], currentUser } = useStore();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Categories', icon: Layers, href: '/categories' },
    { label: 'Wishlist', icon: Heart, href: '/wishlist', badge: wishlist.length },
    { label: 'My Orders', icon: Package, href: currentUser ? '/account?tab=orders' : '/track-order' },
    { label: 'Profile', icon: User, href: currentUser ? '/account' : '/account' }
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 z-40 md:hidden shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href.includes('tab=orders') && pathname === '/account');
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 relative py-1 px-3 rounded-xl transition ${
                isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-bold'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
