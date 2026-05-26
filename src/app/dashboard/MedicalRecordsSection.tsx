'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function MedicalRecordsSection() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vitals, setVitals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'PATIENT') {
        fetchVitalsForPatient();
    } else {
        fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      const response: any = await api.get('/users/patients');
      if (response.success) {
        setPatients(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchVitalsForPatient = async (patientId?: string) => {
    setLoading(true);
    try {
      let url = '/vitals/patient/';
      if (user?.role === 'PATIENT') {
          const profile: any = await api.get('/users/me');
          if (profile.success && profile.data.patient) {
              url += profile.data.patient.id;
          } else {
              throw new Error('Patient record not found');
          }
      } else if (patientId) {
          url += patientId;
      } else {
          setVitals([]);
          return;
      }

      const response: any = await api.get(url);
      if (response.success) {
        setVitals(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch vitals history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (selectedPatientId) {
          fetchVitalsForPatient(selectedPatientId);
      }
  }, [selectedPatientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-100';
      case 'WARNING': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Medical Records</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Vital Signs & Remote Monitoring</p>
            </div>
            {(user?.role === 'NURSE' || user?.role === 'RURAL_HO') && (
                <button 
                    onClick={() => router.push('/vitals/record')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                    Record New
                </button>
            )}
        </div>

        {user?.role !== 'PATIENT' && (
            <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">Filter by Patient</label>
                <select 
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm text-sm md:text-base"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                    <option value="">Select a patient...</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.user.name} ({p.user.phone})</option>
                    ))}
                </select>
            </div>
        )}

        <div className="space-y-6">
          {loading ? (
             <div className="space-y-4">
                 {[1, 2].map(i => (
                     <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 animate-pulse">
                         <div className="flex justify-between mb-6">
                             <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                             <div className="h-4 bg-gray-50 rounded w-16"></div>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                             {[1, 2, 3, 4, 5].map(j => <div key={j} className="h-10 bg-gray-50 rounded-xl"></div>)}
                         </div>
                     </div>
                 ))}
             </div>
          ) : vitals.length === 0 ? (
            <div className="bg-white p-12 md:p-20 text-center rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <h3 className="text-xl font-black text-dark mb-2">No Records Available</h3>
                <p className="text-gray-400 font-medium text-sm">
                    {selectedPatientId || user?.role === 'PATIENT' ? 'No vitals history has been recorded yet.' : 'Please select a patient to see their clinical history.'}
                </p>
            </div>
          ) : (
            vitals.map((record) => (
              <div key={record.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:border-primary/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(record.recordedAt).toLocaleDateString()}</span>
                        <span className="text-gray-200">•</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-600">Recorded by: <span className="text-dark font-black">{record.nurse.user.name}</span></p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${getStatusColor(record.triageResult?.overallStatus)}`}>
                    {record.triageResult?.overallStatus || 'NORMAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mb-8">
                  {[
                      { label: 'BP', value: record.bloodPressure, unit: '' },
                      { label: 'Heart Rate', value: record.heartRate, unit: 'bpm' },
                      { label: 'O2 Sat', value: record.oxygenSat, unit: '%' },
                      { label: 'Temp', value: record.temp, unit: '°C' },
                      { label: 'Glucose', value: record.glucose, unit: 'mg/dL' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{stat.label}</span>
                      <span className="text-base md:text-lg font-black text-dark">{stat.value || '--'} <span className="text-[9px] text-gray-400 font-bold">{stat.unit}</span></span>
                    </div>
                  ))}
                </div>

                {record.notes && (
                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest block mb-2">Clinical Observations</span>
                    <p className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">{record.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
    </div>
  );
}
