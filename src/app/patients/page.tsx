'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

interface Patient {
    id: string;
    userId: string;
    dateOfBirth: string;
    bloodType: string | null;
    chronicConditions: string | null;
    user: {
        id: string;
        name: string;
        phone: string;
        email: string | null;
    }
}

export default function PatientRegistryPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!user || (user.role === 'PATIENT')) {
            router.push('/dashboard');
            return;
        }
        fetchPatients();
    }, [user]);

    const fetchPatients = async (query = '') => {
        setLoading(true);
        try {
            const response: any = await api.get('/users/patients', {
                params: { search: query }
            });
            if (response.success) {
                setPatients(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPatients(search);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-dark tracking-tight">Patient Registry</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Unified Health Records Access</p>
                    </div>
                    <button 
                        onClick={() => router.push('/vitals/record')}
                        className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        Register New Vitals
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-12 glass-card p-6 rounded-[2.5rem] flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search by name, phone, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button type="submit" className="px-8 py-4 bg-dark text-white rounded-2xl font-black hover:bg-black transition-colors">
                        Search
                    </button>
                </form>

                {loading ? (
                    <div className="text-center py-20 font-bold text-gray-400">Syncing patient records...</div>
                ) : patients.length === 0 ? (
                    <div className="bg-white p-20 rounded-[2.5rem] text-center border border-gray-100">
                        <p className="text-gray-500 font-bold">No patients found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((p) => (
                            <div 
                                key={p.id} 
                                onClick={() => router.push(`/patients/${p.id}`)}
                                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5 cursor-pointer group"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                                        {p.user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-dark text-lg leading-tight">{p.user.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{p.user.phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Blood Type</span>
                                        <span className="text-dark">{p.bloodType || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Date of Birth</span>
                                        <span className="text-dark">{new Date(p.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {p.chronicConditions && (
                                    <div className="p-3 bg-red-50 rounded-xl mb-6">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Chronic Conditions</p>
                                        <p className="text-xs font-bold text-red-700 truncate">{p.chronicConditions}</p>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                                        View Full Profile
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
