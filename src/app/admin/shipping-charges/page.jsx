'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  X, 
  Save, 
  ShieldAlert,
  Search,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminShippingChargesPage() {
  const router = useRouter();
  const { 
    adminUser, 
    shippingRules = [], 
    addShippingRule, 
    updateShippingRule, 
    deleteShippingRule, 
    toggleShippingRuleStatus 
  } = useStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Form Fields
  const [stateName, setStateName] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [formError, setFormError] = useState('');

  // Notification Toast
  const [toastMsg, setToastMsg] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('hc_dtf_admin_session');
    if (!adminUser && !saved) {
      router.push('/admin-login');
    }
  }, [adminUser, router]);

  const openAddModal = () => {
    setEditingRule(null);
    setStateName('');
    setChargeAmount('');
    setIsEnabled(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setStateName(rule.state);
    setChargeAmount(rule.charge);
    setIsEnabled(rule.enabled);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!stateName.trim()) {
      setFormError('Please enter a valid State name.');
      return;
    }
    if (chargeAmount === '' || Number(chargeAmount) < 0) {
      setFormError('Please enter a valid non-negative shipping charge amount.');
      return;
    }

    if (editingRule) {
      updateShippingRule(editingRule.id, {
        state: stateName.trim(),
        charge: Number(chargeAmount),
        enabled: isEnabled
      });
      setToastMsg(`Shipping rule for "${stateName.trim()}" updated successfully!`);
    } else {
      addShippingRule({
        state: stateName.trim(),
        charge: Number(chargeAmount),
        enabled: isEnabled
      });
      setToastMsg(`Shipping rule for "${stateName.trim()}" created successfully!`);
    }

    setTimeout(() => setToastMsg(''), 3000);
    setIsModalOpen(false);
  };

  const handleDeleteRule = (id, name) => {
    if (confirm(`Are you sure you want to delete shipping rule for "${name}"?`)) {
      deleteShippingRule(id);
      setToastMsg(`Shipping rule for "${name}" deleted.`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const filteredRules = shippingRules.filter((r) =>
    r.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Truck size={32} className="text-emerald-500" />
            Shipping Charges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete Admin control over state-wise delivery charges and checkout availability
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
        >
          <Plus size={18} />
          <span>Add Shipping Charge</span>
        </button>
      </div>

      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Rules Container */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search State shipping rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">State</th>
                <th className="p-4">Shipping Charge</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-500 font-bold space-y-2">
                    <Truck size={36} className="mx-auto text-slate-700" />
                    <p className="text-white font-extrabold text-sm">No shipping rules found.</p>
                    <p className="text-xs text-slate-500">Click "+ Add Shipping Charge" to create state delivery rates.</p>
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-850 transition">
                    <td className="p-4">
                      <span className="font-extrabold text-white text-sm">{rule.state}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-black text-emerald-400 text-base">₹{rule.charge}</span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => toggleShippingRuleStatus(rule.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 w-fit transition ${
                          rule.enabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                        }`}
                        title="Click to toggle Enabled/Disabled status"
                      >
                        {rule.enabled ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1 transition text-xs"
                          title="Edit Rule"
                        >
                          <Edit size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteRule(rule.id, rule.state)}
                          className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-xl transition"
                          title="Delete Rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Cards View (Visible ONLY on mobile screens) */}
        <div className="md:hidden p-4 space-y-3 divide-y divide-slate-800">
          {filteredRules.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-bold space-y-2">
              <Truck size={36} className="mx-auto text-slate-700" />
              <p className="text-white font-extrabold text-sm">No shipping rules found.</p>
            </div>
          ) : (
            filteredRules.map((rule) => (
              <div key={rule.id} className="pt-3 first:pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-base">{rule.state}</span>
                  <span className="font-black text-emerald-400 text-base">₹{rule.charge}</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleShippingRuleStatus(rule.id)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition ${
                      rule.enabled
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {rule.enabled ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{rule.enabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(rule)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1 text-xs"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id, rule.state)}
                      className="p-1.5 bg-rose-950/60 text-rose-400 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-lg text-white">
                {editingRule ? 'Edit Shipping Charge' : 'Add Shipping Charge'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">State Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telangana, Andhra Pradesh, Maharashtra"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Shipping Charge Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="e.g. 150"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                  />
                  <span>Rule Enabled (Available during checkout)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <Save size={16} /> Save Rule
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
