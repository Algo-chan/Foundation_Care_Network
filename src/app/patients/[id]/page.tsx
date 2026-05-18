'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function PatientDetailsPage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuthStore();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!user || user.role === 'PATIENT') {
            // If it's a patient, they should probably use /vitals or we should check if id === user.patient.id
            // For now, let's assume this is a clinical view.
        }
        fetchPatientDetails();
    }, [id, user]);

    const fetchPatientDetails = async () => {
        setLoading(true);
        try {
            let url = `/users/patients/${id}`;
            if (id === 'me') {
                // Fetch current user profile first to get their patient ID
                const profile: any = await api.get('/users/me');
                if (profile.success && profile.data.patient) {
                    url = `/users/patients/${profile.data.patient.id}`;
                } else {
                    throw new Error('Patient record not found');
                }
            }
            const response: any = await api.get(url);
            if (response.success) {
                setPatient(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch patient details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse">Retrieving Patient File...</div>;
    if (!patient) return <div className="p-20 text-center font-black text-red-500">Patient File Not Found</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CRITICAL': return 'bg-red-500 text-white';
            case 'WARNING': return 'bg-amber-500 text-white';
            default: return 'bg-emerald-500 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/patients')} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-dark tracking-tight">{patient.user.name}</h1>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Patient ID: {patient.id.split('-')[0]}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => router.push('/vitals/record')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all">Record Vitals</button>
                        <button onClick={() => router.push('/prescriptions/new')} className="px-4 py-2 bg-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">New Prescription</button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Sidebar: Bio & Quick Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl mb-4">
                                    {patient.user.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <h2 className="text-2xl font-black text-dark leading-tight">{patient.user.name}</h2>
                                <p className="text-sm font-bold text-gray-400">{patient.user.phone}</p>
                                <div className="mt-4 flex gap-2">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">Active</span>
                                    {patient.isVerified && <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">Verified</span>}
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-gray-50 pt-8">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Age</span>
                                    <span className="text-sm font-black text-dark">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} Years</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Blood Type</span>
                                    <span className="text-sm font-black text-red-600">{patient.bloodType || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</span>
                                    <span className="text-sm font-black text-dark">{new Date(patient.user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {patient.chronicConditions && (
                                <div className="mt-8 p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Chronic Conditions</p>
                                    <p className="text-xs font-bold text-red-700 leading-relaxed">{patient.chronicConditions}</p>
                                </div>
                            )}
                        </section>

                        {/* Recent Vitals Preview Card */}
                        <section className="bg-dark p-8 rounded-[2.5rem] text-white">
                            <h3 className="text-lg font-black mb-6">Latest Vitals</h3>
                            {patient.vitals[0] ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Blood Pressure</p>
                                            <p className="text-2xl font-black">{patient.vitals[0].bloodPressure}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusColor(patient.vitals[0].triageResult?.overallStatus)}`}>
                                            {patient.vitals[0].triageResult?.overallStatus || 'NORMAL'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Heart Rate</p>
                                            <p className="text-sm font-black">{patient.vitals[0].heartRate} bpm</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Oxygen</p>
                                            <p className="text-sm font-black">{patient.vitals[0].oxygenSat}%</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('vitals')} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">View Trends</button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm font-bold">No vitals recorded yet.</p>
                            )}
                        </section>
                    </div>

                    {/* Main Content Area: Tabs */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Tab Switcher */}
                        <nav className="flex gap-4 p-2 bg-gray-100 rounded-2xl">
                            {['overview', 'vitals', 'prescriptions', 'appointments'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-dark'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                        <h4 className="text-lg font-black text-dark mb-6">Upcoming Appointments</h4>
                                        <div className="space-y-4">
                                            {patient.appointments.filter((a: any) => new Date(a.scheduledAt) > new Date()).map((a: any) => (
                                                <div key={a.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-100">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase leading-none">{new Date(a.scheduledAt).toLocaleString('en-US', { month: 'short' })}</span>
                                                        <span className="text-lg font-black text-dark leading-none">{new Date(a.scheduledAt).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-dark">Dr. {a.doctor.user.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold capitalize">{a.type.toLowerCase()} • {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {patient.appointments.length === 0 && <p className="text-gray-400 text-sm font-bold text-center py-4">No scheduled visits.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                        <h4 className="text-lg font-black text-dark mb-6">Active Medications</h4>
                                        <div className="space-y-3">
                                            {patient.prescriptions[0] ? (
                                                (Array.isArray(patient.prescriptions[0].medications) ? patient.prescriptions[0].medications : [patient.prescriptions[0].medications]).map((med: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-50">
                                                        <span className="text-lg">💊</span>
                                                        <p className="text-xs font-bold text-emerald-800">{med}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-sm font-bold text-center py-4">No active prescriptions.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical Timeline */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <h4 className="text-lg font-black text-dark mb-8">Clinical Timeline</h4>
                                    <div className="space-y-8 relative before:absolute before:left-[1.2rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                        {patient.vitals.slice(0, 5).map((v: any, i: number) => (
                                            <div key={v.id} className="relative pl-12">
                                                <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center border-4 border-white shadow-sm ${getStatusColor(v.triageResult?.overallStatus)}`}>
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-dark uppercase tracking-wide">Vitals Recorded</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mb-2">{new Date(v.recordedAt).toLocaleString()}</p>
                                                    <p className="text-sm text-gray-500 font-medium">Recorded by {v.nurse.user.name}. BP: {v.bloodPressure}, Temp: {v.temp}°C.</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vitals Tab */}
                        {activeTab === 'vitals' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {patient.vitals.map((record: any) => (
                                    <div key={record.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-sm font-black text-dark">{new Date(record.recordedAt).toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Nurse: {record.nurse.user.name}</p>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(record.triageResult?.overallStatus)}`}>
                                                {record.triageResult?.overallStatus || 'NORMAL'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {[
                                                { label: 'BP', val: record.bloodPressure },
                                                { label: 'HR', val: `${record.heartRate} bpm` },
                                                { label: 'O2', val: `${record.oxygenSat}%` },
                                                { label: 'Temp', val: `${record.temp}°C` },
                                                { label: 'Glucose', val: `${record.glucose} mg/dL` },
                                            ].map((stat, i) => (
                                                <div key={i} className="p-4 bg-gray-50 rounded-2xl text-center">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                                    <p className="text-sm font-black text-dark">{stat.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {record.notes && (
                                            <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Observation Notes</p>
                                                <p className="text-sm text-gray-700 italic">{record.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Prescriptions Tab */}
                        {activeTab === 'prescriptions' && (
                            <div className="space-y-6 animate-in fade-in duration-500">
                                {patient.prescriptions.map((p: any) => (
                                    <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-black text-dark">Dr. {p.doctor.user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Issued {new Date(p.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {(Array.isArray(p.medications) ? p.medications : [p.medications]).map((med: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <span className="text-primary text-sm">💊</span>
                                                    <p className="text-sm font-bold text-dark">{med}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Appointments Tab */}
                        {activeTab === 'appointments' && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
                                <div className="space-y-8 relative before:absolute before:left-[1.2rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                    {patient.appointments.map((a: any) => (
                                        <div key={a.id} className="relative pl-12">
                                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl flex items-center justify-center border-4 border-white shadow-sm ${new Date(a.scheduledAt) > new Date() ? 'bg-primary' : 'bg-gray-200'}`}>
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-black text-dark">Appointment with Dr. {a.doctor.user.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold mb-2">{new Date(a.scheduledAt).toLocaleString()}</p>
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${a.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {a.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{a.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
