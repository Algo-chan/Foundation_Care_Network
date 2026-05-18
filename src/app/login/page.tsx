'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await api.post('/auth/login', { email, password });
      if (response.success) {
        setAuth(response.data.user, response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 selection:bg-primary/20">
      <div className="max-w-xl w-full">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-12 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-16 h-16 bg-dark rounded-[2rem] flex items-center justify-center shadow-2xl shadow-dark/20 group-hover:scale-110 transition-all duration-500 mb-6">
              <svg className="w-9 h-9 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tighter leading-none">FMC Portal</h1>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3">Foundation Medical Center</p>
        </div>

        <div className="bg-white p-12 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(13,27,42,0.05)] border border-gray-100">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-dark tracking-tight">Access Secure Records</h2>
                <p className="text-sm font-medium text-gray-500 mt-2">Enter your institutional credentials to continue.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">
                        {error}
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Identity</label>
                        <input
                            type="email"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-dark focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-300"
                            placeholder="username@fmc-admin.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Access Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold text-dark focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-300"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-dark text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-primary hover:shadow-2xl hover:shadow-primary/20 transition-all disabled:opacity-50 group flex items-center justify-center gap-3"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Portal'}
                        {!loading && <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                    </button>
                </div>
                
                <div className="pt-8 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                        Authorized Access Only.<br/>Contact administration for credentials.
                    </p>
                </div>
            </form>
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={() => router.push('/')}
                className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-dark transition-colors inline-flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                Return to Landing
            </button>
        </div>
      </div>
    </div>
  );
}
