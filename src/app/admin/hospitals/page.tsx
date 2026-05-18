'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';

interface Hospital {
  id: string;
  name: string;
  location: string;
  specialties: string[];
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHospital, setNewHospital] = useState({ name: '', location: '', specialties: '' });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response: any = await api.get('/admin/hospitals');
      if (response.success) {
        setHospitals(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: any = await api.post('/admin/hospitals', {
        ...newHospital,
        specialties: newHospital.specialties.split(',').map(s => s.trim()).filter(s => s)
      });
      if (response.success) {
        setHospitals([...hospitals, response.data]);
        setIsAdding(false);
        setNewHospital({ name: '', location: '', specialties: '' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create hospital');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hospital?')) return;
    try {
      const response: any = await api.delete(`/admin/hospitals/${id}`);
      if (response.success) {
        setHospitals(hospitals.filter(h => h.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hospital Directory</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs hover:scale-105 transition-transform"
        >
          {isAdding ? 'Cancel' : '+ Add Hospital'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-[2rem] border border-primary/20 shadow-xl shadow-primary/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</label>
              <input
                required
                value={newHospital.name}
                onChange={(e) => setNewHospital({...newHospital, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                placeholder="e.g. Black Lion Hospital"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
              <input
                required
                value={newHospital.location}
                onChange={(e) => setNewHospital({...newHospital, location: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                placeholder="e.g. Addis Ababa"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Specialties (comma separated)</label>
            <input
              value={newHospital.specialties}
              onChange={(e) => setNewHospital({...newHospital, specialties: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
              placeholder="e.g. Cardiology, Neurology, Pediatrics"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-dark text-white rounded-xl font-black text-sm">Save Hospital</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-400 font-bold">Syncing hospital data...</div>
        ) : hospitals.map((h) => (
          <div key={h.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <button onClick={() => handleDelete(h.id)} className="text-rose-300 hover:text-rose-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <h4 className="text-lg font-black text-dark mb-1">{h.name}</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{h.location}</p>
            <div className="flex flex-wrap gap-2">
              {h.specialties.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-md border border-gray-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
