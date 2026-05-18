'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function RecordVitalsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    bloodPressure: '120/80',
    glucose: '',
    heartRate: '',
    oxygenSat: '',
    temp: '',
    notes: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'NURSE') {
      router.push('/dashboard');
      return;
    }
    fetchPatients();
  }, [user]);

  const [triageResult, setTriageResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchPatients = async () => {
    try {
      const response: any = await api.get('/users/patients?assignedToMe=true');
      if (response.success) {
        setPatients(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTriage = async () => {
    if (!formData.notes || formData.notes.length < 10) {
        alert('Please provide more detailed clinical notes/symptoms before analyzing.');
        return;
    }
    setAnalyzing(true);
    setTriageResult(null);
    try {
        const response: any = await api.post('/triage/analyze', {
            symptoms: formData.notes,
            vitals: {
                bloodPressure: formData.bloodPressure,
                heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
                temp: formData.temp ? parseFloat(formData.temp) : undefined,
                oxygenSat: formData.oxygenSat ? parseFloat(formData.oxygenSat) : undefined,
            }
        });
        if (response.success) {
            setTriageResult(response.data);
        }
    } catch (err: any) {
        alert(err.message || 'Triage analysis failed');
    } finally {
        setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
          ...formData,
          glucose: formData.glucose ? parseFloat(formData.glucose) : null,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
          oxygenSat: formData.oxygenSat ? parseFloat(formData.oxygenSat) : null,
          temp: formData.temp ? parseFloat(formData.temp) : null,
          triageResult: triageResult // Attach AI result if available
      };
      
      const response: any = await api.post('/vitals', payload);
      if (response.success) {
        alert('Vitals recorded successfully');
        router.push('/dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record vitals');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tight">Record Vitals</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Blood Pressure (sys/dia)</label>
              <input
                type="text"
                required
                placeholder="120/80"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.bloodPressure}
                onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Heart Rate (bpm)</label>
              <input
                type="number"
                placeholder="72"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Oxygen Saturation (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="98"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.oxygenSat}
                onChange={(e) => setFormData({ ...formData, oxygenSat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="36.6"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.temp}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Blood Glucose (mg/dL)</label>
              <input
                type="number"
                placeholder="90"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Clinical Notes / Symptoms</label>
                <button 
                    type="button"
                    onClick={handleAnalyzeTriage}
                    disabled={analyzing}
                    className="text-[10px] font-black uppercase tracking-widest bg-dark text-white px-3 py-1 rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
                >
                    {analyzing ? 'Analyzing...' : 'Trigger AI Triage ✨'}
                </button>
            </div>
            <textarea
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
              rows={4}
              placeholder="Describe any symptoms or observations (min 10 characters for AI analysis)..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          {triageResult && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black text-white ${
                          triageResult.priority === 'CRITICAL' ? 'bg-red-500' : 
                          triageResult.priority === 'URGENT' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                          {triageResult.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Assessment Guidance</span>
                  </div>
                  <p className="text-sm font-bold text-dark leading-tight">{triageResult.summary}</p>
                  <div className="p-3 bg-white/50 rounded-xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recommendation</p>
                      <p className="text-xs text-gray-600 italic font-medium">"{triageResult.recommendation}"</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium italic">* This is AI assistance only. Always follow doctor instructions.</p>
              </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
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
              {submitting ? 'Recording...' : 'Complete Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
