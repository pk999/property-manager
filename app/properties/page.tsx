'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  PlusCircle, 
  Store, 
  Home, 
  MapPin, 
  Users, 
  ShieldCheck,
  X,
  Trash2,
  AlertTriangle,
  ChevronRight,
  EyeOff,
  Eye,
  Sparkles
} from 'lucide-react';
import { dataService, QuotaExceededError } from '@/lib/services/data-service';
import { Property, Tenant, Landlord } from '@/lib/types/database';
import UpgradePaywallModal from '@/components/UpgradePaywallModal';

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Property Deletion Warning Modal State
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Paywall State
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'shop' | 'residential'>('shop');
  const [address, setAddress] = useState('');

  useEffect(() => {
    setProperties(dataService.getProperties(true));
    setTenants(dataService.getTenants(true));
    setLandlord(dataService.getLandlord());
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
      if (err instanceof QuotaExceededError) {
        setPaywallReason(err.message);
        setPaywallOpen(true);
      } else {
        alert(err.message);
      }
    }
  };

  const handleOpenDeleteModal = (e: React.MouseEvent, p: Property) => {
    e.stopPropagation(); // prevent navigation
    setSelectedProperty(p);
    setShowDeleteModal(true);
  };

  const handleToggleInactive = (p: Property) => {
    const updated = dataService.togglePropertyStatus(p.id);
    setProperties(properties.map(item => item.id === p.id ? updated : item));
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = (p: Property) => {
    dataService.deleteProperty(p.id, true);
    setProperties(properties.filter(item => item.id !== p.id));
    setTenants(dataService.getTenants(true));
    setShowDeleteModal(false);
  };

  const handlePropertyCardClick = (pId: string) => {
    router.push(`/tenants?propertyId=${pId}`);
  };

  const activePropertiesCount = properties.filter(p => p.status !== 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Property Manager
          </h2>
          <p className="text-sm text-slate-500 font-medium">Click any property to view its linked tenants</p>
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
          const linkedTenants = tenants.filter(t => t.property_id === p.id && t.status !== 'archived');
          const isInactive = p.status === 'inactive';

          return (
            <div
              key={p.id}
              onClick={() => handlePropertyCardClick(p.id)}
              className={`glass-card glass-card-hover rounded-3xl p-5 border cursor-pointer transition-all ${
                isInactive
                  ? 'border-slate-300 bg-slate-100/80 opacity-75'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                      isInactive
                        ? 'bg-slate-200 border-slate-300 text-slate-500'
                        : 'bg-blue-50 border-blue-200 text-blue-600'
                    }`}
                  >
                    {p.property_type === 'shop' ? <Store className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        {p.property_type}
                      </span>

                      {isInactive && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <EyeOff className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {p.address || 'Commercial Zone'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenDeleteModal(e, p)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete or Inactivate Property"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Tenants Quick List & Filter Button */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 font-bold text-slate-900">
                  <Users className="w-4 h-4 text-blue-600" /> {linkedTenants.length} Linked Shop Tenant(s)
                </span>
                
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  View Tenants <ChevronRight className="w-4 h-4" />
                </span>
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
              <h3 className="text-lg font-bold text-slate-900">Add New Property / Building</h3>
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
                  placeholder="e.g. Sirisha Amma Commercial Complex Phase 2"
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

      {/* Delete / Inactivate Property Warning Modal */}
      {showDeleteModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 w-full max-w-md bg-white border border-slate-200 space-y-4 shadow-xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            
            <h3 className="text-xl font-bold text-slate-900">Manage Property Status</h3>
            
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              You are selecting <strong>"{selectedProperty.title}"</strong>.
            </p>

            {/* List Linked Tenants */}
            {(() => {
              const linked = tenants.filter(t => t.property_id === selectedProperty.id && t.status !== 'archived');
              if (linked.length > 0) {
                return (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs space-y-1">
                    <span className="font-bold text-amber-900 block">
                      ⚠️ Linked Active Tenants ({linked.length}):
                    </span>
                    <ul className="list-disc pl-4 text-amber-800 font-medium">
                      {linked.map(t => (
                        <li key={t.id}>{t.full_name} ({t.unit_no})</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-amber-700 pt-1">
                      Deleting this property will also archive these linked tenants.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            <p className="text-xs text-slate-500">
              💡 <strong>Recommendation:</strong> Make the property <strong>Inactive</strong> instead to preserve all past payment ledgers and tenant histories.
            </p>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleToggleInactive(selectedProperty)}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                <span>{selectedProperty.status === 'inactive' ? 'Re-activate Property' : 'Make Property Inactive (Recommended)'}</span>
              </button>

              <button
                onClick={() => handleConfirmDelete(selectedProperty)}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Property & Archive Tenants</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2 rounded-2xl text-slate-500 hover:text-slate-900 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Paywall Modal */}
      <UpgradePaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={paywallReason}
      />
    </div>
  );
}
