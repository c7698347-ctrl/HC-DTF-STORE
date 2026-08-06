'use client';

import React from 'react';
import { BarChart3, FileSpreadsheet, FileText, Download, TrendingUp, Users, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function AdminReportsPage() {
  const { products, orders, categories, customers } = useStore();

  // Dynamic Metrics Calculated strictly from Database Orders
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysRevenue = orders
    .filter(o => o.createdAt?.startsWith(todayStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const currentMonthStr = todayStr.slice(0, 7);
  const monthlyRevenue = orders
    .filter(o => o.createdAt?.startsWith(currentMonthStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const currentYearStr = todayStr.slice(0, 4);
  const yearlyRevenue = orders
    .filter(o => o.createdAt?.startsWith(currentYearStr))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const returningCustomersCount = customers.filter(c => (c.totalOrders || 0) > 1).length;
  const repeatRate = customers.length > 0 ? Math.round((returningCustomersCount / customers.length) * 100) : 0;

  const exportExcelReport = () => {
    if (orders.length === 0) {
      alert('No sales data available in database to export.');
      return;
    }

    const reportData = orders.map((o) => ({
      'Order ID': o.id,
      'Date': new Date(o.createdAt).toLocaleDateString(),
      'Customer Name': o.customerName,
      'Email': o.customerEmail,
      'Subtotal': o.subtotal,
      'GST 18%': o.gst,
      'Shipping': o.shipping,
      'Total Amount (INR)': o.total,
      'Status': o.status,
      'Payment Method': o.paymentMethod || 'Razorpay'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
    XLSX.writeFile(workbook, `HC_DTF_Sales_Report_${todayStr}.xlsx`);
  };

  const exportPDFReport = () => {
    if (orders.length === 0) {
      alert('No sales data available in database to export.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('HC DTF STORE - EXECUTIVE SALES REPORT', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Orders Count: ${orders.length}`, 14, 38);
    doc.text(`Total Gross Revenue: Rs.${totalRevenue.toLocaleString()}`, 14, 44);
    
    let y = 56;
    doc.text('Orders Breakdown:', 14, y);
    y += 8;

    orders.forEach((o, idx) => {
      doc.text(`${idx + 1}. ID: ${o.id} - Customer: ${o.customerName} - Total: Rs.${o.total} - Status: ${o.status}`, 14, y);
      y += 6;
    });

    doc.save(`HC_DTF_Executive_Report_${todayStr}.pdf`);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Analytics & Financial Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Export daily, monthly and yearly sales metrics strictly from real database records</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportExcelReport}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 transition"
          >
            <FileSpreadsheet size={16} /> Export Excel (.xlsx)
          </button>

          <button
            onClick={exportPDFReport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <FileText size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{todaysRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold">Calculated from today's orders</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold">Calculated from monthly orders</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yearly Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-white">₹{yearlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-semibold">Calculated from yearly orders</p>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Categories */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Top Categories</h3>
          {orders.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 font-bold">
              No sales data available.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-emerald-400 font-extrabold">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Acquisition */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Customer Acquisition</h3>
          {customers.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 font-bold">
              No customer data available.
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300">Total Registered Customers: <strong className="text-emerald-400">{customers.length}</strong></p>
              <p className="text-slate-300">Repeat Customer Frequency: <strong className="text-emerald-400">{repeatRate}%</strong></p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
