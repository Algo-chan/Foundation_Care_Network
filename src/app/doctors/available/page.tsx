'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface Hospital {
  id: string;
  name: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

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

export default function PublicDoctorAvailabilityPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('All');
  const [hospitalId, setHospitalId] = useState('All');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [connected, setConnected] = useState(false);
  const router = useRouter();

  const fetchDoctors = useCallback(async (spec: string, hospId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (spec && spec !== 'All') params.set('specialty', spec);
      if (hospId && hospId !== 'All') params.set('hospitalId', hospId);
      const res = await fetch(`${API}/doctors/available?${params}`);
      const json = await res.json();
      if (json.success) {
        setDoctors(json.data);
        const uniqueHospitals = Array.from(
          new Map(json.data.map((d: Doctor) => [d.hospital.id, { id: d.hospital.id, name: d.hospital.name }])).values()
        );
        setHospitals(uniqueHospitals as Hospital[]);
      }
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors(specialty, hospitalId);
  }, [specialty, hospitalId, fetchDoctors]);

  const fetchSingleDoctor = useCallback(async (doctorId: string) => {
    try {
      const res = await fetch(`${API}/doctors/available/${doctorId}`);
      const json = await res.json();
      if (json.success) return json.data as Doctor;
    } catch {
    }
    return null;
  }, []);

  useEffect(() => {
    const socket = connectToPublic();
    setConnected(true);

    socket.on('doctor:availability-changed', (data: { doctorId: string; isAvailable: boolean }) => {
      if (!data.isAvailable) {
        setDoctors((prev) => prev.filter((d) => d.id !== data.doctorId));
      } else {
        fetchSingleDoctor(data.doctorId).then((doc) => {
          if (doc) {
            setDoctors((prev) => {
              if (prev.some((d) => d.id === doc.id)) return prev;
              return [...prev, doc];
            });
          }
        });
      }
    });

    return () => {
      socket.off('doctor:availability-changed');
      disconnectSocket();
    };
  }, [fetchSingleDoctor]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-[#0D1B2A] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#028090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-black text-[#0D1B2A] tracking-tight">FCN</span>
          </div>
          <div className="flex items-center gap-4">
            {connected && (
              <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 bg-[#0D1B2A] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#028090] transition-all"
            >
              Staff Login
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0D1B2A] tracking-tight">
              Find a Doctor
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Browse available doctors and book an appointment instantly.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full md:w-48 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0D1B2A] focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090] outline-none cursor-pointer"
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
              ))}
            </select>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full md:w-56 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0D1B2A] focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090] outline-none cursor-pointer"
            >
              <option value="All">All Hospitals</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
            <button
              onClick={() => router.push('/doctors/map')}
              className="px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black text-[#0D1B2A] hover:border-[#028090] transition-all whitespace-nowrap"
            >
              Map View
            </button>
          </div>
        </div>

        {doctors.length > 0 && (
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
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
              {specialty !== 'All' && hospitalId === 'All'
                ? `No ${specialty} specialists are currently available. Try a different specialty.`
                : specialty === 'All' && hospitalId !== 'All'
                  ? 'No doctors available at this hospital. Try a different location.'
                  : specialty !== 'All' && hospitalId !== 'All'
                    ? `No ${specialty} specialists at this location. Adjust your filters.`
                    : 'All doctors are currently offline. Please check back later.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:border-[#028090]/20 hover:shadow-xl hover:shadow-[#028090]/5 transition-all group"
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
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Wait Time</p>
                    <p className={`font-black text-lg ${doctor.waitMinutes > 30 ? 'text-amber-600' : doctor.waitMinutes > 60 ? 'text-red-600' : 'text-emerald-600'}`}>
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

                <a
                  href={`tel:${doctor.user.phone}`}
                  className="block mt-3 text-center text-xs font-bold text-[#028090] hover:underline"
                >
                  Call {doctor.hospital.name}
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-gray-400">
            Foundation Care Network — Public Doctor Directory
          </p>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Data updates in real-time
          </p>
        </div>
      </footer>
    </div>
  );
}
