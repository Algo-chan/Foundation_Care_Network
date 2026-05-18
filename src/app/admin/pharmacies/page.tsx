'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';

interface Pharmacy {
  id: string;
  name: string;
  location: string;
  phone: string;
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPharmacy, setNewPharmacy] = useState({ name: '', location: '', phone: '' });

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      const response: any = await api.get('/admin/pharmacies');
      if (response.success) {
        setPharmacies(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: any = await api.post('/admin/pharmacies', newPharmacy);
      if (response.success) {
        setPharmacies([...pharmacies, response.data]);
        setIsAdding(false);
        setNewPharmacy({ name: '', location: '', phone: '' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create pharmacy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pharmacy?')) return;
    try {
      const response: any = await api.delete(`/admin/pharmacies/${id}`);
      if (response.success) {
        setPharmacies(pharmacies.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pharmacy Network</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs hover:scale-105 transition-transform"
        >
          {isAdding ? 'Cancel' : '+ Add Pharmacy'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pharmacy Name</label>
              <input
                required
                value={newPharmacy.name}
                onChange={(e) => setNewPharmacy({...newPharmacy, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                placeholder="e.g. Kenema Pharmacy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
              <input
                required
                value={newPharmacy.location}
                onChange={(e) => setNewPharmacy({...newPharmacy, location: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                placeholder="e.g. Bole, Addis Ababa"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
              <input
                required
                value={newPharmacy.phone}
                onChange={(e) => setNewPharmacy({...newPharmacy, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                placeholder="e.g. +251..."
              />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-dark text-white rounded-xl font-black text-sm">Register Pharmacy</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-400 font-bold">Syncing pharmacy data...</div>
        ) : pharmacies.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 font-medium italic">No pharmacies registered in the network yet.</div>
        ) : pharmacies.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.34a2 2 0 01-1.783 0l-.691-.34a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.34.34a2 2 0 000 2.828l1.246 1.246a2 2 0 002.828 0l1.246-1.246a2 2 0 012.828 0l1.246 1.246a2 2 0 002.828 0l1.246-1.246a2 2 0 000-2.828l-.34-.34z" /></svg>
              </div>
              <button onClick={() => handleDelete(p.id)} className="text-rose-300 hover:text-rose-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h4 className="text-lg font-black text-dark mb-1">{p.name}</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{p.location}</p>
            <p className="text-[11px] font-bold text-primary">{p.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
