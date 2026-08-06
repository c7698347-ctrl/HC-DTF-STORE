'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Package,
  Layers,
  BarChart2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function AdminDashboardPage() {
  const { products, orders, customers, categories } = useStore();

  // Dynamic Date Filters strictly from real Database Orders
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7);
  const currentYearStr = todayStr.slice(0, 4);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Revenue Calculations
  const todaysRevenue = orders
    .filter(o => o.createdAt && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const weeklyRevenue = orders
    .filter(o => o.createdAt && new Date(o.createdAt) >= sevenDaysAgo)
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const monthlyRevenue = orders
    .filter(o => o.createdAt && o.createdAt.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const yearlyRevenue = orders
    .filter(o => o.createdAt && o.createdAt.startsWith(currentYearStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // 2. Orders Calculations
  const todaysOrdersCount = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr)).length;
  const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'Cancelled').length;

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // 3. Customers Calculations
  const returningCustomersCount = customers.filter(c => (c.totalOrders || 0) > 1).length;
  const totalLtvSum = customers.reduce((sum, c) => sum + (c.lifetimeValue || c.totalSpent || 0), 0);
  const avgCustomerLtv = customers.length > 0 ? Math.round(totalLtvSum / customers.length) : 0;

  // 4. Products & Stock Calculations
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 15);

  // 5. Aggregate Product Sales from Real Database Orders
  const productSalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = { name: item.name, quantity: 0, revenue: 0, image: item.images?.[0] };
      }
      productSalesMap[item.name].quantity += (item.quantity || 1);
      productSalesMap[item.name].revenue += ((item.offerPrice || item.price) * (item.quantity || 1));
    });
  });

  const topSellingProductsList = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 4);

  // 6. Aggregate Category Sales from Real Database Orders
  const categorySalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(item => {
      const catName = item.category || 'General';
      if (!categorySalesMap[catName]) {
        categorySalesMap[catName] = { name: catName, quantity: 0, revenue: 0 };
      }
      categorySalesMap[catName].quantity += (item.quantity || 1);
      categorySalesMap[catName].revenue += ((item.offerPrice || item.price) * (item.quantity || 1));
    });
  });

  const topSellingCategoriesList = Object.values(categorySalesMap)
    .sort((a, b) => b.revenue - a.revenue);

  // 7. Graph Data strictly from Real Database Orders
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const realChartData = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(dateStr));
    const dayRev = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    realChartData.push({
      day: dayLabel,
      date: dateStr,
      revenue: dayRev,
      orders: dayOrders.length
    });
  }

  const hasSalesData = orders.length > 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Executive Analytics Control Center</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time revenue metrics, order velocity & database financial calculations</p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Database Analytics Active</span>
        </div>
      </div>

      {/* 1. Main Revenue Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{todaysRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Today's Orders: {todaysOrdersCount}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{weeklyRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">Last 7 days sales</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{monthlyRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Current month total</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yearly Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{yearlyRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 font-semibold">Current year total</p>
        </div>

      </div>

      {/* 2. Orders & Customers Secondary Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Total Orders</span>
          <span className="text-xl font-extrabold text-white block">{orders.length}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Avg Order: ₹{averageOrderValue}</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase block">Pending Orders</span>
          <span className="text-xl font-extrabold text-amber-400 block">{pendingOrdersCount}</span>
          <span className="text-[10px] text-slate-500 font-medium block">In production / transit</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Completed Orders</span>
          <span className="text-xl font-extrabold text-emerald-400 block">{completedOrdersCount}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Delivered successfully</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-rose-400 font-extrabold uppercase block">Cancelled Orders</span>
          <span className="text-xl font-extrabold text-rose-400 block">{cancelledOrdersCount}</span>
          <span className="text-[10px] text-slate-500 font-medium block">Voided transactions</span>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Total Customers</span>
          <span className="text-xl font-extrabold text-white block">{customers.length}</span>
          <span className="text-[10px] text-emerald-400 font-medium block">Returning: {returningCustomersCount}</span>
        </div>

      </div>

      {/* 3. Real Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Graph */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Revenue Graph</span>
            <span className="text-xs font-normal text-slate-400">7-Day Real Sales Trend</span>
          </h3>

          {!hasSalesData ? (
            <div className="h-64 w-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs font-extrabold">
              <BarChart2 size={32} className="text-slate-700" />
              <p>Revenue Graph: Waiting for sales data.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sales Volume Graph */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Sales Graph</span>
            <span className="text-xs font-normal text-slate-400">7-Day Orders Count</span>
          </h3>

          {!hasSalesData ? (
            <div className="h-64 w-full bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs font-extrabold">
              <BarChart2 size={32} className="text-slate-700" />
              <p>Sales Graph: Waiting for sales data.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={realChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="orders" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* 4. Products & Categories Sales Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Flame size={18} className="text-emerald-400" /> Top Products
            </h3>
            <span className="text-xs text-slate-400 font-bold">Real Quantity Sold</span>
          </div>

          <div className="space-y-3">
            {topSellingProductsList.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 font-bold space-y-1">
                <Package size={28} className="mx-auto text-slate-700" />
                <p>Top Products: No products sold yet.</p>
              </div>
            ) : (
              topSellingProductsList.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />}
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{p.name}</h4>
                      <p className="text-emerald-400 font-bold">Total Sales: ₹{p.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-lg">
                    {p.quantity} Sold
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers size={18} className="text-emerald-400" /> Top Categories
            </h3>
            <span className="text-xs text-slate-400 font-bold">Real Revenue Contribution</span>
          </div>

          <div className="space-y-3">
            {topSellingCategoriesList.length === 0 ? (
              <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 font-bold space-y-1">
                <Layers size={28} className="mx-auto text-slate-700" />
                <p>Top Categories: No sales data available.</p>
              </div>
            ) : (
              topSellingCategoriesList.map((c, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{c.name}</h4>
                    <p className="text-slate-400">{c.quantity} items ordered</p>
                  </div>
                  <span className="text-emerald-400 font-extrabold bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-800">
                    ₹{c.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
