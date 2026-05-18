'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ConsultationsPage() {
  const { user } = useAuthStore();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }
    fetchConsultations();
  }, [user]);

  const fetchConsultations = async () => {
    try {
      const response: any = await api.get('/consultations/my');
      if (response.success) {
        setConsultations(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: any = await api.post('/consultations', { notes });
      if (response.success) {
        setConsultations([response.data, ...consultations]);
        setNotes('');
      }
    } catch (err) {
      alert('Failed to request consultation');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const feedback = prompt('Enter your notes/feedback for the Rural HO:');
    if (!feedback) return;

    try {
      const response: any = await api.patch(`/consultations/${id}`, { status, notes: feedback });
      if (response.success) {
        setConsultations(consultations.map(c => c.id === id ? { ...c, status, notes: feedback } : c));
      }
    } catch (err) {
      alert('Failed to update consultation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8">Expert Consultations</h1>

        {user?.role === 'RURAL_HO' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20 mb-8">
            <h2 className="text-lg font-bold text-primary mb-4">Request Specialist Input</h2>
            <form onSubmit={handleCreate} className="flex gap-4">
              <input 
                type="text" 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the case and what help you need..."
                className="flex-1 px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                required
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-opacity-90 transition-all"
              >
                Send Request
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading consultations...</p>
        ) : consultations.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No consultation records found.</p>
        ) : (
          <div className="space-y-4">
            {consultations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {c.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Requested: {new Date(c.startedAt).toLocaleDateString()}</p>
                  </div>
                  {user?.role === 'DOCTOR' && c.status !== 'COMPLETED' && (
                    <button 
                        onClick={() => handleUpdateStatus(c.id, 'COMPLETED')}
                        className="text-xs font-bold text-primary hover:underline"
                    >
                        Resolve Case
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Rural HO Request:</p>
                  <p className="text-sm text-gray-600">{c.notes}</p>
                </div>
                {c.status === 'COMPLETED' && (
                   <div className="mt-4 border-t pt-4">
                     <p className="text-sm font-bold text-primary">Specialist Feedback:</p>
                     <p className="text-sm text-gray-600 italic">Case resolved by specialist.</p>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
            <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 text-sm hover:underline"
            >
                &larr; Back to Dashboard
            </button>
        </div>
      </div>
    </div>
  );
}
