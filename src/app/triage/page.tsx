'use client';

import { useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function TriagePage() {
  const [formData, setFormData] = useState({
    symptoms: '',
    bloodPressure: '',
    heartRate: '',
    temp: '',
    oxygenSat: '',
    patientHistory: ''
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response: any = await api.post('/triage/analyze', {
        symptoms: formData.symptoms,
        vitals: {
          bloodPressure: formData.bloodPressure,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
          temp: formData.temp ? parseFloat(formData.temp) : undefined,
          oxygenSat: formData.oxygenSat ? parseFloat(formData.oxygenSat) : undefined,
        },
        patientHistory: formData.patientHistory
      });

      if (response.success) {
        setResult(response.data);
      }
    } catch (err: any) {
      alert(err.message || 'Triage analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-primary text-2xl font-black tracking-tighter italic">AI</span>
            </div>
            <div>
                <h1 className="text-4xl font-black text-dark tracking-tight leading-none mb-1">Smart Triage</h1>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Powered by Claude 3.5 Sonnet</p>
            </div>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Current Symptoms</label>
                <textarea
                  name="symptoms"
                  required
                  rows={4}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                  placeholder="Describe the symptoms in detail (e.g. Sharp chest pain for 2 hours, difficulty breathing...)"
                  value={formData.symptoms}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Blood Pressure</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    placeholder="120/80"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    name="heartRate"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                    value={formData.heartRate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temp"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                    value={formData.temp}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Oxygen Sat (%)</label>
                  <input
                    type="number"
                    name="oxygenSat"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                    value={formData.oxygenSat}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Medical History (Optional)</label>
                <textarea
                  name="patientHistory"
                  rows={2}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-dark"
                  placeholder="Known conditions, allergies, or previous treatments..."
                  value={formData.patientHistory}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-xl shadow-primary/20 text-lg font-black text-white bg-primary hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'AI Model Processing...' : 'Run Triage Analysis ✨'}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-10 rounded-[2.5rem] border ${
                result.priority === 'CRITICAL' ? 'bg-red-50 border-red-100' :
                result.priority === 'URGENT' ? 'bg-amber-50 border-amber-100' :
                'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black text-white ${
                    result.priority === 'CRITICAL' ? 'bg-red-500' :
                    result.priority === 'URGENT' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}>
                    {result.priority} PRIORITY
                  </span>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Medical Assessment</span>
                </div>
                <h3 className="text-3xl font-black text-dark mb-4 leading-tight tracking-tight">{result.summary}</h3>
                <div className="bg-white/60 p-6 rounded-2xl border border-white">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Recommendation</p>
                  <p className="text-base text-gray-700 italic font-medium leading-relaxed">"{result.recommendation}"</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Suggested Specialist</p>
                    <p className="text-xl font-black text-primary tracking-tight">{result.specialized_doctor}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/doctors?specialty=' + result.specialized_doctor)}
                  className="px-6 py-3 bg-dark text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-colors"
                >
                    Find Doctor
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 px-4 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  New Analysis
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-4 px-4 bg-primary/10 text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  Save to Record
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-400 font-medium italic">Disclaimer: AI output is for guidance only. Always follow direct medical advice.</p>
            </div>
          )}
        </div>
        
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
