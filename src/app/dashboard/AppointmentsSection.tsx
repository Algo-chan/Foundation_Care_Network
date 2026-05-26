'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AppointmentsSection() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response: any = await api.get('/appointments/my');
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const response: any = await api.patch(`/appointments/${id}`, { status });
      if (response.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Appointments</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Your medical schedule</p>
        </div>
        {user?.role === 'PATIENT' && (
          <button 
            className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            Book New
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-gray-50 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                </div>
            ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 md:p-20 rounded-[2.5rem] text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-black text-dark mb-2">No Appointments Found</h3>
          <p className="text-gray-500 font-medium mb-8">You don't have any scheduled medical visits at the moment.</p>
          {user?.role === 'PATIENT' && (
              <button 
                  className="px-8 py-3 bg-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors"
              >
                  Find a Doctor &rarr;
              </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg md:text-xl">
                    {(user?.role === 'PATIENT' ? apt.doctor.user.name : apt.patient.user.name).split(' ').map((n: any) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-dark text-base md:text-lg leading-tight truncate">
                        {user?.role === 'PATIENT' ? `Dr. ${apt.doctor.user.name}` : apt.patient.user.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 truncate">
                        {user?.role === 'PATIENT' ? apt.doctor.specialty : 'Patient'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${
                    apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    apt.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-gray-50 text-gray-400 border border-gray-100'
                }`}>
                    {apt.status}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="truncate">{new Date(apt.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm font-bold text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-100">
                    {apt.type.replace('_', ' ')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                {user?.role === 'DOCTOR' && apt.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                      className="w-full sm:flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}
                      className="w-full sm:flex-1 py-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                    >
                      Decline
                    </button>
                  </>
                )}
                {apt.status === 'CONFIRMED' && (
                    <button 
                        className="w-full py-3 bg-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors"
                        onClick={() => {/* Open details or medical record */}}
                    >
                        View Details
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
