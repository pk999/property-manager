'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Store, 
  Home, 
  MapPin, 
  Users, 
  ShieldCheck,
  X
} from 'lucide-react';
import { dataService } from '@/lib/services/data-service';
import { Property, Tenant } from '@/lib/types/database';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'shop' | 'residential'>('shop');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setProperties(dataService.getProperties());
    setTenants(dataService.getTenants());
  }, []);

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const newProperty = dataService.addProperty({
        title,
        property_type: propertyType,
        address,
      });

      setProperties([newProperty, ...properties]);
      setShowAddModal(false);
      setTitle('');
      setAddress('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Property Manager
          </h2>
          <p className="text-sm text-slate-500 font-medium">Sirisha Amma's Commercial Real Estate & Shops</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Properties Cards List */}
      <div className="space-y-4">
        {properties.map((p) => {
          const propertyTenants = tenants.filter(t => t.property_id === p.id);
          return (
            <div key={p.id} className="glass-card rounded-3xl p-5 border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  {p.property_type === 'shop' ? <Store className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {p.property_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.address || 'Commercial Zone'}
                  </p>
                </div>
              </div>

              {/* Tenants Quick List */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-blue-600" /> {propertyTenants.length} Active Shop Tenants
                </span>
                <span className="text-slate-500 font-semibold">Quota Guard: &lt; 200 Properties</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Property / Complex</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sirisha Amma Shopping Complex Phase 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Property Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'shop', label: 'Commercial Shop' },
                    { id: 'residential', label: 'Residential House' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setPropertyType(type.id as any)}
                      className={`py-2.5 rounded-xl font-bold border text-xs ${
                        propertyType === type.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="Main Market Road, Commercial Zone"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md mt-2"
              >
                Save Property
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
