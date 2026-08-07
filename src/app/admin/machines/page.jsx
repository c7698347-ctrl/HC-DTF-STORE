'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Upload, 
  Eye, 
  EyeOff, 
  Save, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminMachinesPage() {
  const { 
    machineConfig = {}, 
    setMachineConfig, 
    machines = [], 
    addMachine, 
    updateMachine, 
    deleteMachine 
  } = useStore();

  const [savedMsg, setSavedMsg] = useState('');

  // Section Config Form State
  const [sectionEnabled, setSectionEnabled] = useState(machineConfig.enabled !== false);
  const [sectionTitle, setSectionTitle] = useState(machineConfig.sectionTitle || '🔥 JUKE HEAT PRESS MACHINES');
  const [sectionSubtitle, setSectionSubtitle] = useState(machineConfig.sectionSubtitle || 'Professional Heavy Duty Heat Press Machines for Commercial DTF Printing');

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);

  const [name, setName] = useState('');
  const [size, setSize] = useState('16×24 Inches');
  const [price, setPrice] = useState('25000');
  const [stock, setStock] = useState('50');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('220V 50Hz, Aluminium Teflon Coated Platen, 1 Year Tech Warranty');
  const [voltage, setVoltage] = useState('220V 50Hz');
  const [warranty, setWarranty] = useState('1 Year Manufacturer Technical Support Warranty');
  const [buttonText, setButtonText] = useState('Buy Now');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [visible, setVisible] = useState(true);

  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setName('');
    setSize('16×24 Inches');
    setPrice('25000');
    setStock('50');
    setImage('');
    setDescription('');
    setFeatures('220V 50Hz, Aluminium Teflon Coated Platen, 1 Year Tech Warranty');
    setVoltage('220V 50Hz');
    setWarranty('1 Year Manufacturer Technical Support Warranty');
    setButtonText('Buy Now');
    setDisplayOrder('1');
    setVisible(true);
    setEditingMachine(null);
  };

  const handleSaveSectionConfig = (e) => {
    e.preventDefault();
    setMachineConfig({
      enabled: sectionEnabled,
      sectionTitle: sectionTitle.trim(),
      sectionSubtitle: sectionSubtitle.trim()
    });

    setSavedMsg('Homepage Heat Press Section Configuration saved live!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleImageFileUpload = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter machine model name');
      return;
    }

    const payload = {
      name: name.trim(),
      size: size.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      image: image || '/images/juke_heat_press_16x24.png',
      description: description.trim(),
      features: features.trim(),
      voltage: voltage.trim(),
      warranty: warranty.trim(),
      buttonText: buttonText.trim() || 'Buy Now',
      displayOrder: Number(displayOrder) || 1,
      visible
    };

    if (editingMachine) {
      updateMachine(editingMachine.id, payload);
    } else {
      addMachine(payload);
    }

    setShowModal(false);
    resetForm();

    setSavedMsg('Machine inventory updated live!');
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const handleEditClick = (m) => {
    setEditingMachine(m);
    setName(m.name);
    setSize(m.size || '');
    setPrice(m.price || '');
    setStock(m.stock ?? 50);
    setImage(m.image || '');
    setDescription(m.description || '');
    setFeatures(m.features || '');
    setVoltage(m.voltage || '220V 50Hz');
    setWarranty(m.warranty || '1 Year Manufacturer Technical Support Warranty');
    setButtonText(m.buttonText || 'Buy Now');
    setDisplayOrder(m.displayOrder || 1);
    setVisible(m.visible !== false);
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">Commercial Heat Press Machines Manager</h1>
          <p className="text-xs text-slate-400 mt-1">Single source of truth for all homepage JUKE heat press machinery, prices, stock & section visibility</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
        >
          <Plus size={18} /> Add New Machine Model
        </button>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* 1. HOMEPAGE SECTION DISPLAY & VISIBILITY CONTROLLER */}
      <form onSubmit={handleSaveSectionConfig} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <Wrench size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg">Homepage Machinery Section Controls</h2>
              <p className="text-xs text-slate-400">Controls whether the machine section renders on the homepage</p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
            <input
              type="checkbox"
              checked={sectionEnabled}
              onChange={(e) => setSectionEnabled(e.target.checked)}
              className="w-5 h-5 text-emerald-500 rounded focus:ring-0 cursor-pointer"
            />
            <span className={`text-xs font-black uppercase tracking-wider ${sectionEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sectionEnabled ? 'Section Enabled' : 'Section Hidden'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Section Main Title *</label>
            <input
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Section Subtitle *</label>
            <input
              type="text"
              required
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-lg transition flex items-center justify-center gap-2"
        >
          <Save size={16} /> Save Homepage Machinery Section Settings
        </button>
      </form>

      {/* 2. LIVE MACHINERY CATALOG LIST */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-extrabold text-white text-lg">Live Machine Inventory Models ({machines.length})</h2>
          <span className="text-xs text-slate-400 font-medium">All machines load dynamically from context/database</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {machines.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center text-slate-500 font-bold space-y-2 bg-slate-950 rounded-2xl border border-slate-800">
              <Wrench size={36} className="mx-auto text-slate-700" />
              <p className="text-white font-extrabold text-sm">No machine models configured.</p>
              <p className="text-xs text-slate-500">Click "Add New Machine Model" to create one.</p>
            </div>
          ) : (
            machines.map((m) => (
              <div key={m.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-black text-white text-base">{m.name}</span>
                    <button
                      onClick={() => updateMachine(m.id, { visible: !m.visible })}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border transition ${
                        m.visible !== false 
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {m.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{m.visible !== false ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>

                  <div className="flex gap-4 items-center">
                    <img
                      src={m.image || '/images/juke_heat_press_16x24.png'}
                      alt={m.name}
                      className="w-24 h-24 object-contain bg-white rounded-xl p-2 border border-slate-800 shrink-0"
                    />

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-400">Size: <strong className="text-white">{m.size}</strong></p>
                      <p className="text-slate-400">Price: <strong className="text-emerald-400 text-sm">₹{m.price?.toLocaleString()}</strong></p>
                      <p className="text-slate-400">Stock: <strong className="text-white">{m.stock} Units</strong></p>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{m.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleEditClick(m)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => deleteMachine(m.id)}
                    className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. ADD / EDIT MACHINE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white z-10 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-black text-xl text-white">
                {editingMachine ? 'Edit Machine Model' : 'Add New Machine Model'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-5 text-xs">
              
              {/* Machine Name & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Machine Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JUKE Heat Press Machine 20×24"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Machine Platen Size *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20×24 Inches"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="35000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-400 font-extrabold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Stock Available *</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Machine Image</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files?.length > 0) handleImageFileUpload(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center transition ${
                    isDragOver ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <Upload size={24} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">Upload Machine Advertisement Photo</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageFileUpload(e.target.files)}
                    className="hidden"
                    id="mach-img-input"
                  />
                  <label
                    htmlFor="mach-img-input"
                    className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-block transition"
                  >
                    Browse Image
                  </label>
                </div>

                {image && (
                  <div className="mt-3 flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <img src={image} alt="" className="w-16 h-16 object-contain bg-white rounded-xl p-1" />
                    <span className="text-xs text-slate-400 font-mono truncate">{image.slice(0, 40)}...</span>
                  </div>
                )}
              </div>

              {/* Description & Features */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Commercial heavy duty machine details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Voltage / Power *</label>
                  <input
                    type="text"
                    required
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Warranty *</label>
                  <input
                    type="text"
                    required
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white"
                  />
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-extrabold text-white text-xs">Visible on Homepage Store</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span className="text-xs font-bold text-slate-300">{visible ? 'Active' : 'Hidden'}</span>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/30 transition"
                >
                  {editingMachine ? 'Save Changes' : 'Save Machine'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
