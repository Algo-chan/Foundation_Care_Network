'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: string;
  user: { name: string; phone: string };
  specialty: string;
  isAvailable: boolean;
  hospital: { name: string; location: string };
}

export default function DoctorMapPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response: any = await api.get('/doctors/available');
      if (response.success) {
        setDoctors(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                &larr;
            </button>
            <h1 className="text-xl font-bold text-dark">Live Health Map: Dire Dawa</h1>
        </div>
        <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Updates</span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-[#e5e7eb]">
        {/* Interactive SVG Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 800 600" className="w-full h-full max-w-4xl opacity-20">
                <path d="M100,100 L700,100 L750,300 L650,500 L150,550 L50,350 Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="2" />
                <path d="M200,150 Q400,100 600,200 T700,450" fill="none" stroke="#4b5563" strokeWidth="1" strokeDasharray="5,5" />
            </svg>
        </div>

        {/* Map UI Layers */}
        <div className="absolute inset-0 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pointer-events-none">
                {loading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                        <p className="text-gray-500 animate-pulse font-medium">Calibrating health worker positions...</p>
                    </div>
                ) : doctors.map((doctor, index) => (
                    <div 
                        key={doctor.id} 
                        className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white pointer-events-auto transform hover:-translate-y-1 transition-all"
                        style={{ 
                            marginLeft: `${(index % 3) * 20}px`,
                            marginTop: `${Math.sin(index) * 50}px` 
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-dark text-sm">{doctor.user.name}</h3>
                                <p className="text-[10px] text-primary font-bold uppercase">{doctor.specialty}</p>
                            </div>
                            <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-3">📍 {doctor.hospital.name}</p>
                        <div className="flex gap-2">
                            <a 
                                href={`tel:${doctor.user.phone}`}
                                className="flex-1 py-1 text-center bg-primary text-white text-[10px] font-bold rounded hover:bg-opacity-90 transition-colors"
                            >
                                Contact
                            </a>
                            <button className="flex-1 py-1 text-center bg-gray-100 text-gray-600 text-[10px] font-bold rounded hover:bg-gray-200 transition-colors">
                                Directions
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-8 right-8 flex flex-col space-y-2">
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center font-bold text-lg hover:bg-gray-50">+</button>
            <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center font-bold text-lg hover:bg-gray-50">-</button>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-8 left-8 bg-dark/80 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-white/10 max-w-xs">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Network Status: Dire Dawa</p>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-2xl font-bold">{doctors.length}</p>
                    <p className="text-[10px] text-gray-300">Active Professionals</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-green-400">98%</p>
                    <p className="text-[10px] text-gray-300">Coverage</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
