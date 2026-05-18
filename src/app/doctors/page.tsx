'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import { connectToPublic, disconnectSocket, getSocket } from '@/utils/socket';

interface Doctor {
  id: string;
  user: { name: string; phone: string };
  specialty: string;
  isAvailable: boolean;
  hospital: { id: string; name: string; location: string };
  waitTime: string;
  waitMinutes: number;
  nextAvailableSlot: string | null;
}

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Pediatrics',
  'General',
  'Internal Medicine',
  'Endocrinology',
  'Neurology',
  'Orthopedics',
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('All');
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  const fetchDoctors = useCallback(async (spec: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (spec && spec !== 'All') params.specialty = spec;
      const response: any = await api.get('/doctors/available', { params });
      if (response.success) setDoctors(response.data);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors(specialty);
  }, [specialty, fetchDoctors]);

  useEffect(() => {
    const socket = connectToPublic();
    setConnected(true);

    socket.on('doctor:availability-changed', (data: { doctorId: string; isAvailable: boolean }) => {
      setDoctors((prev) => {
        if (!data.isAvailable) {
          return prev.filter((d) => d.id !== data.doctorId);
        }
        fetchDoctors(specialty);
        return prev;
      });
    });

    return () => {
      socket.off('doctor:availability-changed');
      disconnectSocket();
    };
  }, [specialty, fetchDoctors]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-[#0D1B2A] tracking-tight">Available Doctors</h1>
              {connected && (
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium">Browse specialists and book your appointment</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full md:w-52 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0D1B2A] focus:ring-2 focus:ring-[#028090]/20 outline-none cursor-pointer"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
            <button
              onClick={() => router.push('/doctors/map')}
              className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-[#0D1B2A] hover:border-[#028090] transition-all"
            >
              Map View
            </button>
          </div>
        </div>

        {doctors.length > 0 && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} currently available</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] border border-gray-100 p-8 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-50 rounded w-full" />
                  <div className="h-3 bg-gray-50 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-[#0D1B2A] mb-2">No Doctors Available</h3>
            <p className="text-gray-500 font-medium">
              {specialty !== 'All'
                ? `No ${specialty} specialists available. Try a different specialty.`
                : 'All doctors are currently offline.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:border-[#028090]/20 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#028090]/10 flex items-center justify-center text-[#028090] font-black text-xl group-hover:scale-110 transition-transform">
                    {doctor.user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#0D1B2A] text-lg leading-tight truncate">{doctor.user.name}</h3>
                    <p className="text-[#028090] text-sm font-bold">{doctor.specialty}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 whitespace-nowrap">
                    Available
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-bold text-gray-600 truncate">{doctor.hospital.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-bold text-gray-600">{doctor.hospital.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Wait</p>
                    <p className={`font-black text-lg ${doctor.waitMinutes > 60 ? 'text-red-600' : doctor.waitMinutes > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {doctor.waitTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Slot</p>
                    <p className="font-black text-lg text-[#0D1B2A]">
                      {doctor.nextAvailableSlot
                        ? new Date(doctor.nextAvailableSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Today full'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/appointments?doctorId=${doctor.id}`)}
                  className="w-full py-3.5 bg-[#028090] text-white rounded-xl font-black text-sm hover:bg-[#028090]/90 transition-all shadow-lg shadow-[#028090]/20"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-[2.5rem] border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#028090]/10 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#028090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-[#0D1B2A]">Real-Time Availability</p>
                <p className="text-sm text-gray-500">Doctor status updates instantly — no refresh needed.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-[#0D1B2A] text-white rounded-xl font-black text-sm hover:bg-[#028090] transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
