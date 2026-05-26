'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { connectToPublic, getSocket } from '@/utils/socket';

export default function ConsultationsSection() {
  const { user } = useAuthStore();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConsultations = useCallback(async () => {
    try {
      const response: any = await api.get('/consultations/my');
      if (response.success) {
        setConsultations(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectConsultation = useCallback(async (c: any) => {
    setActiveConsultation(c);
    const socket = getSocket();
    socket.emit('join:consultation', c.id);
    
    try {
        const res: any = await api.get(`/consultations/${c.id}/messages`);
        if (res.success) {
            setMessages(res.data);
        }
    } catch (err) {
        console.error('Failed to fetch messages');
    }
  }, []);

  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConsultation) return;

    const socket = getSocket();
    socket.emit('send:message', {
        consultationId: activeConsultation.id,
        senderId: user!.id,
        content: newMessage
    });
    setNewMessage('');
  }, [newMessage, activeConsultation, user]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: any = await api.post('/consultations', { notes });
      if (response.success) {
        setConsultations(prev => [response.data, ...prev]);
        setNotes('');
        selectConsultation(response.data);
      }
    } catch (err) {
      alert('Failed to request consultation');
    }
  }, [notes, selectConsultation]);

  const handleAssign = useCallback(async (id: string) => {
    try {
        const response: any = await api.post(`/consultations/${id}/assign`);
        if (response.success) {
            setConsultations(prev => prev.map(c => c.id === id ? response.data : c));
            selectConsultation(response.data);
        }
    } catch (err) {
        alert('Failed to pick up case');
    }
  }, [selectConsultation]);

  const handleUpdateStatus = useCallback(async (id: string, status: string) => {
    const feedback = prompt('Enter final resolution notes:');
    if (!feedback) return;

    try {
      const response: any = await api.patch(`/consultations/${id}`, { status, notes: feedback });
      if (response.success) {
        setConsultations(prev => prev.map(c => c.id === id ? { ...c, status, notes: feedback } : c));
        if (activeConsultation?.id === id) {
            setActiveConsultation((prev: any) => ({ ...prev, status, notes: feedback }));
        }
      }
    } catch (err) {
      alert('Failed to update consultation');
    }
  }, [activeConsultation]);

  useEffect(() => {
    fetchConsultations();

    const socket = connectToPublic();
    socket.on('new:message', (message: any) => {
        setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
        });
    });

    return () => {
        socket.off('new:message');
    };
  }, [fetchConsultations]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile when a consultation is selected
  useEffect(() => {
    if (activeConsultation && window.innerWidth < 768) {
        setIsSidebarOpen(false);
    }
  }, [activeConsultation]);

  const selectConsultationInternal = (c: any) => {
    selectConsultation(c);
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row h-[75vh] md:h-[70vh] overflow-hidden relative">
      {/* Sidebar: Consultation List */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden md:flex'} w-full md:w-80 bg-gray-50/50 border-r border-gray-100 flex-col absolute inset-0 z-20 md:relative md:inset-auto`}>
        <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
                <h3 className="text-lg md:text-xl font-black text-dark tracking-tight">Consultations</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Specialist Network</p>
            </div>
            {activeConsultation && (
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {user?.role === 'RURAL_HO' && (
                <div className="p-4 bg-white sticky top-0 z-10 border-b border-gray-50">
                    <button 
                        onClick={() => { setActiveConsultation('new'); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                        className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            activeConsultation === 'new' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        + New Request
                    </button>
                </div>
            )}

            {loading ? (
                <div className="p-10 text-center text-xs font-bold text-gray-400">Loading...</div>
            ) : consultations.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-gray-400 italic">No active cases.</div>
            ) : consultations.map((c) => (
                <div 
                    key={c.id} 
                    onClick={() => selectConsultationInternal(c)}
                    className={`p-6 cursor-pointer transition-all hover:bg-white ${activeConsultation?.id === c.id ? 'bg-white border-l-4 border-primary shadow-sm' : ''}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            c.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            c.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {c.status}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">{new Date(c.startedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-black text-dark line-clamp-2 leading-snug">{c.notes}</p>
                </div>
            ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white relative">
        {!activeConsultation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <h3 className="text-lg md:text-xl font-black text-dark mb-2">Clinical Console</h3>
                <p className="text-gray-400 text-xs md:text-sm font-medium max-w-xs">Select a case from the network to start discussion.</p>
                <button onClick={() => setIsSidebarOpen(true)} className="mt-6 md:hidden px-6 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase">View Cases</button>
            </div>
        ) : activeConsultation === 'new' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50/30">
                <div className="w-full max-w-lg bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mb-4 text-primary font-bold text-xs uppercase">&larr; Back to List</button>
                    <h2 className="text-xl md:text-2xl font-black text-dark mb-2">Request Specialist</h2>
                    <p className="text-xs md:text-sm text-gray-500 font-medium mb-6 md:mb-8">Describe the clinical case briefly.</p>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Symptoms, history..."
                            className="w-full h-32 md:h-40 p-4 md:p-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] md:rounded-3xl font-bold text-dark focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all text-sm md:text-base"
                            required
                        />
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setActiveConsultation(null)}
                                className="flex-1 py-3 md:py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-[2] py-3 md:py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                            >
                                Send Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        ) : (
            <>
                {/* Chat Header */}
                <header className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-dark">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </button>
                        <div className="min-w-0">
                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">
                                {activeConsultation.status === 'PENDING' ? 'Unassigned' : 'Active Case'}
                            </p>
                            <h3 className="font-black text-dark truncate text-sm md:text-base">{activeConsultation.notes}</h3>
                        </div>
                    </div>
                    {user?.role === 'DOCTOR' && (
                        activeConsultation.status === 'PENDING' ? (
                            <button 
                                onClick={() => handleAssign(activeConsultation.id)}
                                className="shrink-0 px-3 md:px-6 py-2 bg-primary text-white rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                Pick Up
                            </button>
                        ) : activeConsultation.status !== 'COMPLETED' && (
                            <button 
                                onClick={() => handleUpdateStatus(activeConsultation.id, 'COMPLETED')}
                                className="shrink-0 px-3 md:px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest border border-emerald-100"
                            >
                                Resolve
                            </button>
                        )
                    )}
                </header>

                {/* Messages Container */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-[#F8FAFC]">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.senderId === user!.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl shadow-sm ${
                                m.senderId === user!.id ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-dark rounded-tl-none border border-gray-100'
                            }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-60">
                                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest truncate max-w-[100px]">{m.sender.name}</p>
                                    <span className="text-[8px] font-bold">•</span>
                                    <p className="text-[8px] font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <p className="text-xs md:text-sm font-bold leading-relaxed">{m.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                {activeConsultation.status !== 'COMPLETED' ? (
                    <footer className="p-4 md:p-6 bg-white border-t border-gray-100">
                        <form onSubmit={sendMessage} className="flex gap-3 md:gap-4">
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type msg..."
                                className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl font-bold text-dark focus:ring-2 focus:ring-primary/20 outline-none text-sm md:text-base"
                            />
                            <button 
                                type="submit"
                                className="w-12 h-12 md:w-14 md:h-14 bg-primary text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" /></svg>
                            </button>
                        </form>
                    </footer>
                ) : (
                    <footer className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Case Resolved</p>
                    </footer>
                )}
            </>
        )}
      </main>
    </div>
  );
}
