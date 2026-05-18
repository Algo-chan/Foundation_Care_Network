'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

import { Suspense } from 'react';

function NewPrescriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const patientIdFromQuery = searchParams.get('patientId');
  
  const [patients, setPatients] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: patientIdFromQuery || '',
    medications: '',
    notes: '',
    pharmacyId: '',
    expiresAt: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') {
      router.push('/dashboard');
      return;
    }
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, pharmaciesRes]: any = await Promise.all([
        api.get('/users/patients'),
        api.get('/pharmacies')
      ]);
      
      if (patientsRes.success) setPatients(patientsRes.data);
      if (pharmaciesRes.success) setPharmacies(pharmaciesRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response: any = await api.post('/prescriptions', {
        ...formData,
        medications: formData.medications.split('\n').filter(m => m.trim() !== '') // Convert to array
      });
      
      if (response.success) {
        alert('Digital prescription issued successfully');
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Initializing clinical form...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tight">Issue Digital Prescription</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Select Patient</label>
                <select
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark cursor-pointer"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                >
                  <option value="">Choose a patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.user.name} ({p.user.phone})</option>
                  ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Preferred Pharmacy (Optional)</label>
                <select
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark cursor-pointer"
                  value={formData.pharmacyId}
                  onChange={(e) => setFormData({ ...formData, pharmacyId: e.target.value })}
                >
                  <option value="">Any Partner Pharmacy</option>
                  {pharmacies.map((ph) => (
                    <option key={ph.id} value={ph.id}>{ph.name} - {ph.location}</option>
                  ))}
                </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Medications (one per line)</label>
            <textarea
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
              rows={4}
              placeholder="Example:
Amoxicillin 500mg - 3x daily - 7 days
Paracetamol 1000mg - every 6 hours as needed"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Doctor's Instructions & Notes</label>
            <textarea
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
              rows={3}
              placeholder="Additional instructions for the patient or pharmacist..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Expiry Date (Optional)</label>
            <input
                type="date"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">Digitally Signed & Verified</span>
            </div>
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 text-gray-500 font-bold hover:text-dark transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {submitting ? 'Issuing...' : 'Issue Prescription'}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-bold">Loading...</div>}>
      <NewPrescriptionContent />
    </Suspense>
  );
}
