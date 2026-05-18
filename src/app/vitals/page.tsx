'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function VitalsHistoryPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vitals, setVitals] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'PATIENT') {
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
          // We need the patient record ID, not the user ID.
          // Let's get the profile first to find the patient ID.
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
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  if (loading && !vitals.length && !patients.length) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="space-y-1">
                <h1 className="text-4xl font-black text-dark tracking-tight">Health Records</h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Vital Signs & Remote Monitoring</p>
            </div>
            {user?.role === 'NURSE' && (
                <button 
                    onClick={() => router.push('/vitals/record')}
                    className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                    Record New Vitals
                </button>
            )}
        </div>

        {user?.role !== 'PATIENT' && (
            <div className="mb-12 glass-card p-8 rounded-[2.5rem]">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 block">Filter by Patient</label>
                <select 
                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
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

        <div className="space-y-4">
          {vitals.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl shadow-sm text-gray-500">
                {selectedPatientId || user?.role === 'PATIENT' ? 'No vitals history found.' : 'Select a patient to see their vitals history.'}
            </div>
          ) : (
            vitals.map((record) => (
              <div key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-gray-500">{new Date(record.recordedAt).toLocaleString()}</span>
                    <p className="text-sm font-medium text-gray-700">Recorded by: {record.nurse.user.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(record.triageResult?.overallStatus)}`}>
                    {record.triageResult?.overallStatus || 'NORMAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">BP</span>
                    <span className="font-bold">{record.bloodPressure}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Heart Rate</span>
                    <span className="font-bold">{record.heartRate || '--'} bpm</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">O2 Sat</span>
                    <span className="font-bold">{record.oxygenSat || '--'}%</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Temp</span>
                    <span className="font-bold">{record.temp || '--'} °C</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Glucose</span>
                    <span className="font-bold">{record.glucose || '--'} mg/dL</span>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <span className="text-xs text-blue-600 font-bold block mb-1">Nurse Notes</span>
                    <p className="text-sm text-gray-700">{record.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
