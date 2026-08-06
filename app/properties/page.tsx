'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Store, Home, ShieldCheck } from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Property } from '@/lib/types/database';
import { PropertySchema } from '@/lib/security/zod-schemas';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'shop' | 'house' | 'commercial' | 'residential'>('shop');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setProperties(dataService.getProperties());
  }, []);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = PropertySchema.safeParse({ title, property_type: propertyType, address });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    try {
      const newProp = dataService.addProperty({ title, property_type: propertyType, address });
      setProperties([newProp, ...properties]);
      setTitle('');
      setAddress('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Error creating property');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-5 h-5 text-emerald-400" /> Properties & Buildings
          </h2>
          <p className="text-xs text-slate-400">Manage shops, commercial complexes and houses</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Property Cards List */}
      <div className="space-y-3">
        {properties.map((p) => (
          <div key={p.id} className="glass-card glass-card-hover rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  {p.property_type === 'shop' ? <Store className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400">{p.address || 'Jaipur, Rajasthan'}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700 uppercase tracking-wider">
                {p.property_type}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Add New Property</h3>
            
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateProperty} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Property Name / Complex Title</label>
                <input
                  type="text"
                  placeholder="e.g. Shop No. 4, Gokul Market"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e: any) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="shop">Commercial Shop</option>
                  <option value="house">Residential House / Flat</option>
                  <option value="commercial">Commercial Building</option>
                  <option value="residential">Residential Villa</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Station Road, Jaipur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow-md"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
