'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark">My Appointments</h1>
          {user?.role === 'PATIENT' && (
            <button 
              onClick={() => router.push('/doctors')}
              className="px-4 py-2 bg-primary text-white font-bold rounded-md hover:bg-opacity-90"
            >
              Book New Appointment
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 mb-4">You have no upcoming appointments.</p>
            {user?.role === 'PATIENT' && (
                <button 
                    onClick={() => router.push('/doctors')}
                    className="text-primary font-bold hover:underline"
                >
                    Find a doctor now &rarr;
                </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      apt.status === 'CONFIRMED' ? 'bg-green-500' :
                      apt.status === 'PENDING' ? 'bg-yellow-500' :
                      apt.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'
                    }`}></span>
                    <h3 className="font-bold text-dark">
                        {user?.role === 'PATIENT' ? `Dr. ${apt.doctor.user.name}` : apt.patient.user.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(apt.scheduledAt).toLocaleDateString()} at {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">{apt.type.replace('_', ' ')}</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {user?.role === 'DOCTOR' && apt.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'CONFIRMED')}
                        className="flex-1 md:flex-none px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-md hover:bg-green-600"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')}
                        className="flex-1 md:flex-none px-4 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-md hover:bg-red-200"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {apt.status}
                  </span>
                </div>
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
