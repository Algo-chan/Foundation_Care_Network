'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { connectToDoctorRoom, disconnectSocket, emitToggleAvailability } from '@/utils/socket';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login');
    } else if (isHydrated && user?.role === 'DOCTOR') {
      fetchAvailability();
    }
  }, [user, router, isHydrated]);

  useEffect(() => {
    if (user?.role === 'DOCTOR') {
      const socket = connectToDoctorRoom(user.id);
      socket.on('doctor:availability-changed', () => {
        fetchAvailability();
      });
      return () => {
        socket.off('doctor:availability-changed');
        disconnectSocket();
      };
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const response: any = await api.get('/users/me');
      if (response.success && response.data.doctor) {
        setIsAvailable(response.data.doctor.isAvailable);
      }
    } catch (err) {
      console.error('Failed to fetch availability');
    }
  };

  const handleToggleAvailability = async () => {
    setLoading(true);
    try {
      const result = await emitToggleAvailability(user!.id);
      if (result.success) {
        setIsAvailable(result.isAvailable!);
        if (result.isAvailable) {
          startLocationTracking();
        }
      } else {
        alert(result.message || 'Failed to update availability');
      }
    } catch {
      alert('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await api.patch('/doctors/location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        } catch (err) {
          console.error('Location sync failed');
        }
      });
    }
  };

  useEffect(() => {
    if (isAvailable) {
        const interval = setInterval(startLocationTracking, 30000);
        return () => clearInterval(interval);
    }
  }, [isAvailable]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-dark flex-col sticky top-0 h-screen">
        <div className="p-8">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <span className="text-xl font-black text-white tracking-tighter">FCN Portal</span>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
            {[
                { id: 'overview', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { id: 'doctors', label: 'Find Doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { id: 'appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { id: 'vitals', label: 'Medical Records', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'messages', label: 'Consultations', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            ].map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'doctors') { router.push('/doctors'); return; }
                      setActiveTab(item.id);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Logged in as</p>
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-primary font-bold mt-1">{user.role.replace('_', ' ')}</p>
            </div>
            <button 
                onClick={() => { logout(); router.push('/login'); }}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 h-20 flex items-center px-8 justify-between">
            <h2 className="text-xl font-black text-dark tracking-tight">Overview</h2>
            
            <div className="flex items-center gap-6">
                {user.role === 'DOCTOR' && (
                    <div className="flex items-center bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                        <span className="text-[10px] font-black uppercase tracking-widest mr-3 text-gray-500">Status</span>
                        <button
                            onClick={handleToggleAvailability}
                            disabled={loading}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            isAvailable ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`ml-3 text-xs font-black uppercase ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                            {isAvailable ? 'Active' : 'Offline'}
                        </span>
                    </div>
                )}
                
                <div className="relative group cursor-pointer">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 group-hover:border-primary transition-colors">
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 cursor-pointer" onClick={() => router.push('/settings')}>
                    <span className="text-primary font-black text-xs">{user.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
            </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Welcome Widget */}
            <section className="glass-card bg-gradient-to-br from-primary to-primary-dark p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="relative z-10 text-white space-y-4">
                    <h3 className="text-4xl font-black tracking-tight">Welcome back, {user.name.split(' ')[0]}!</h3>
                    <p className="text-white/80 font-medium max-w-md">Your personalized FCN dashboard is ready. You have 3 appointments scheduled for today.</p>
                    <div className="pt-4 flex gap-4">
                        <button className="px-6 py-2.5 bg-white text-primary rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-xl">View Schedule</button>
                        <button className="px-6 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-xl font-black text-sm hover:bg-white/30 transition-all">Quick Report</button>
                    </div>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Patient Reach', value: '1,284', trend: '+12%', color: 'text-blue-600' },
                    { label: 'Avg. Response', value: '14 min', trend: '-2m', color: 'text-emerald-600' },
                    { label: 'Critical Flags', value: '03', trend: 'Stable', color: 'text-amber-600' },
                    { label: 'Satisfaction', value: '4.9/5', trend: '+0.1', color: 'text-purple-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-primary/20 transition-colors shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <p className="text-2xl font-black text-dark tracking-tight">{stat.value}</p>
                            <span className={`text-[10px] font-bold ${stat.color} px-2 py-0.5 rounded-full bg-gray-50`}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                {/* Dynamic Actions based on Role */}
                {user.role === 'ADMIN' && (
                    <div onClick={() => router.push('/admin/users')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                            <svg className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-dark mb-2">User Management</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Approve doctor accounts and manage system access levels.</p>
                    </div>
                )}

                {user.role === 'PATIENT' && (
                    <>
                        {[
                            { title: 'My Health Profile', desc: 'View your complete medical history and bio-data.', link: '/patients/me', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                            { title: 'Find a Doctor', desc: 'Search and book available specialists.', link: '/doctors', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                            { title: 'My Appointments', desc: 'View upcoming and past medical visits.', link: '/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                            { title: 'Smart Triage', desc: 'Analyze symptoms using Claude AI.', link: '/triage', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { title: 'Vitals Tracker', desc: 'Track your health history trends.', link: '/vitals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                        ].map((action, i) => (
                            <div key={i} onClick={() => {
                                if (action.link === '/patients/me') {
                                    router.push('/patients/me');
                                } else {
                                    router.push(action.link);
                                }
                            }} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer group">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                    <svg className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} /></svg>
                                </div>
                                <h3 className="text-xl font-black text-dark mb-2">{action.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{action.desc}</p>
                            </div>
                        ))}
                    </>
                )}

                {user.role === 'DOCTOR' && (
                    <>
                        <div onClick={() => router.push('/appointments')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">Appointments</h3>
                            <p className="text-gray-500 text-sm">Manage your patient schedule.</p>
                        </div>
                        <div onClick={() => router.push('/patients')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">Patient Registry</h3>
                            <p className="text-gray-500 text-sm">Access and manage all patient files.</p>
                        </div>
                        <div onClick={() => router.push('/consultations')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">Consultations</h3>
                            <p className="text-gray-500 text-sm">Respond to Rural HO requests.</p>
                        </div>
                    </>
                )}

                {user.role === 'NURSE' && (
                    <>
                        <div onClick={() => router.push('/vitals/record')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">Record Vitals</h3>
                            <p className="text-gray-500 text-sm">Enter signs for home-monitored patients.</p>
                        </div>
                        <div onClick={() => router.push('/vitals')} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-dark mb-2">Vitals History</h3>
                            <p className="text-gray-500 text-sm">View patient records history.</p>
                        </div>
                    </>
                )}
            </div>

            {/* Sprint Progress Footer */}
            <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black">4</div>
                    <div>
                        <h4 className="font-black text-dark">Current Phase: Sprint 4</h4>
                        <p className="text-sm text-gray-600 font-medium">Vitals & Remote Monitoring Live</p>
                    </div>
                </div>
                <div className="h-2 flex-1 max-w-md bg-white/50 rounded-full overflow-hidden mx-8 hidden md:block">
                    <div className="h-full bg-primary w-1/2 rounded-full"></div>
                </div>
                <button className="px-6 py-2 bg-dark text-white rounded-xl font-bold text-sm hover:bg-black transition-colors">View Roadmap</button>
            </div>
        </div>
      </main>
    </div>
  );
}
