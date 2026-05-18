'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-primary/20">
      {/* Premium Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center shadow-2xl shadow-dark/20 group-hover:scale-110 transition-all duration-500">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          <div className="flex flex-col">
              <span className="text-2xl font-black text-dark tracking-tighter leading-none">FMC</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">Foundation Medical Center</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-10">
            <button onClick={() => router.push('/doctors/available')} className="text-xs font-black text-gray-400 hover:text-dark uppercase tracking-widest transition-colors">
              Find a Doctor
            </button>
            {['Services', 'About'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black text-gray-400 hover:text-dark uppercase tracking-widest transition-colors">
                {item}
              </a>
            ))}
            <div className="h-8 w-px bg-gray-100 mx-2"></div>
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-3 bg-dark text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:shadow-2xl hover:shadow-primary/20 transition-all shadow-lg"
            >
              Go to Portal
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-40 overflow-hidden bg-[#F8FAFC]">
          <div className="absolute top-0 right-0 -z-10 w-2/3 h-full opacity-5 mesh-gradient blur-3xl rounded-full translate-x-1/4 -translate-y-1/4"></div>
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-24">
              <div className="flex-1 space-y-10">
                <div className="inline-flex items-center px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-3"></span>
                  Advanced Institutional Healthcare
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-dark leading-[0.9] tracking-tighter">
                  Excellence in <br/>
                  <span className="text-gradient">Medical Care.</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                  A state-of-the-art clinical infrastructure providing 
                  comprehensive care for our community through advanced digitalization.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <button 
                    onClick={() => router.push('/login')}
                    className="px-12 py-5 bg-dark text-white font-black rounded-2xl text-lg hover:bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center gap-4 group shadow-xl"
                  >
                    Access Patient Portal
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                  <button 
                    onClick={() => router.push('/login')}
                    className="px-12 py-5 bg-white text-dark border-2 border-gray-100 font-black rounded-2xl text-lg hover:border-primary hover:text-primary transition-all shadow-md"
                  >
                    Staff Access
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(13,27,42,0.15)] border-[16px] border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
                    alt="Professional Medical Care" 
                    className="w-full h-[600px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-12 -left-12 z-20 bg-white p-10 rounded-[2.5rem] hidden md:block border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-dark tracking-tighter">100%</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uptime Record</p>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100"></div>
                    <div className="flex items-center gap-4 text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Secure Network Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        <section className="py-12 bg-white border-y border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Institutional Accreditation</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span className="text-sm font-black text-dark">Medical Board</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span className="text-sm font-black text-dark">Health Authority</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span className="text-sm font-black text-dark">Ministry of Health</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <span className="text-sm font-black text-dark">Clinical Excellence</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Network Ecosystem Section */}
        <section id="network" className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-primary font-black tracking-[0.3em] uppercase text-xs">Our Ecosystem</h2>
                    <p className="text-5xl md:text-6xl font-black text-dark tracking-tighter leading-none">Integrated Care.</p>
                    <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg pt-4">Connecting all departments and specialists into one high-performance digital infrastructure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { 
                            role: 'Specialized Doctors', 
                            desc: 'Our specialists use FMC to provide high-fidelity consultations and manage complex patient records.',
                            img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600'
                        },
                        { 
                            role: 'Clinical Staff', 
                            desc: 'Nurses and technicians record real-time vitals and manage daily patient workflows with precision.',
                            img: 'https://images.unsplash.com/photo-1584515159910-689360697992?auto=format&fit=crop&q=80&w=600'
                        },
                        { 
                            role: 'Administrative Care', 
                            desc: 'Our administrative team ensures seamless scheduling and record management for all institutional needs.',
                            img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600'
                        }
                    ].map((step, i) => (
                        <div key={i} className="group space-y-8">
                            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                <img src={step.img} alt={step.role} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent flex flex-col justify-end p-8 text-white">
                                    <p className="text-2xl font-black leading-tight mb-2">{step.role}</p>
                                    <p className="text-xs font-medium text-white/80 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Clinical Workflow Section */}
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tighter leading-tight">
                            How the System <br/>
                            <span className="text-primary">Saves Lives.</span>
                        </h2>
                        <div className="space-y-12 pt-8">
                            {[
                                { step: '01', title: 'Clinical Triage', desc: 'Patient visits our facility. Staff records symptoms and vitals on the FMC clinical interface.' },
                                { step: '02', title: 'AI Analysis', desc: 'Claude 3.5 AI instantly analyzes the data, providing a risk score and triage level (Normal/Warning/Critical).' },
                                { step: '03', title: 'Instant Sync', desc: 'Data is synced to our central registry, alerting relevant specialists within the institution.' },
                                { step: '04', title: 'Specialist Review', desc: 'Doctors review the high-fidelity vitals history and provide immediate consultation or referral.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-8 group">
                                    <div className="text-4xl font-black text-gray-100 group-hover:text-primary/20 transition-colors">{item.step}</div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-dark">{item.title}</p>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="relative rounded-[4rem] overflow-hidden shadow-2xl shadow-dark/10 border-[12px] border-white">
                            <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=1000" alt="Specialist Consulting" className="w-full h-[700px] object-cover" />
                            <div className="absolute top-12 right-12 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl max-w-[240px]">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-dark uppercase tracking-widest">Clinical Alert</span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 leading-relaxed">System flagged abnormal heart rate for Patient #829. Immediate review requested.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Background Accent */}
            <div className="absolute top-1/2 left-0 w-1/3 h-full bg-primary/5 -translate-y-1/2 blur-[120px] rounded-full"></div>
        </section>

        {/* Feature Showcase */}
        <section id="services" className="py-32 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="space-y-4">
                <h2 className="text-primary font-black tracking-[0.3em] uppercase text-xs">Clinical Ecosystem</h2>
                <p className="text-5xl md:text-6xl font-black text-dark tracking-tight">System Core Modules.</p>
              </div>
              <p className="text-gray-500 font-medium max-w-sm">
                Proprietary technology developed specifically for the unique challenges of modern healthcare delivery.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[
                {
                  title: "Intelligent Triage",
                  desc: "Our triage engine uses Claude 3.5 AI to analyze symptoms, providing clinical decision support to staff and flagging critical cases for immediate specialist review.",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                  color: "text-blue-600 bg-blue-50",
                  img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                },
                {
                  title: "Unified Patient Registry",
                  desc: "A single source of truth for every patient. Medical history, chronic conditions, and vital trends are instantly accessible by authorized personnel within the institution.",
                  icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                  color: "text-emerald-600 bg-emerald-50",
                  img: "https://images.unsplash.com/photo-1504813184591-01592fd03cf7?auto=format&fit=crop&q=80&w=800"
                }
              ].map((service, i) => (
                <div key={i} className="group bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                  <div className="h-64 overflow-hidden">
                    <img src={service.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={service.title} />
                  </div>
                  <div className="p-12 space-y-6">
                    <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} /></svg>
                    </div>
                    <h3 className="text-3xl font-black text-dark">{service.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-primary rounded-[4rem] p-16 md:p-32 relative overflow-hidden group shadow-2xl shadow-primary/20 text-center">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                            Advanced Healthcare <br/> Starts Here.
                        </h2>
                        <p className="text-xl text-white/80 font-medium max-w-2xl mx-auto">
                            The FMC Portal is our central hub for clinical excellence and patient management.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button 
                                onClick={() => router.push('/login')}
                                className="px-12 py-5 bg-white text-primary font-black rounded-2xl text-xl hover:scale-105 transition-transform shadow-2xl"
                            >
                                Access Portal
                            </button>
                            <button 
                                onClick={() => router.push('/login')}
                                className="px-12 py-5 bg-dark text-white font-black rounded-2xl text-xl hover:bg-black transition-all shadow-2xl"
                            >
                                Staff Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
      
      {/* Comprehensive Footer */}
      <footer className="pt-32 pb-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                <div className="space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-dark rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <span className="text-2xl font-black text-dark tracking-tighter uppercase">FMC</span>
                    </div>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed">
                        Foundation Medical Center (FMC) is a digital healthcare initiative to modernize clinical infrastructure through high-fidelity monitoring and AI-assisted triage.
                    </p>
                    <div className="flex gap-4">
                        {['twitter', 'linkedin', 'facebook'].map(social => (
                            <div key={social} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary cursor-pointer transition-colors shadow-sm">
                                <span className="sr-only">{social}</span>
                                <div className="w-4 h-4 bg-current rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-dark uppercase tracking-[0.3em]">Portal Access</h4>
                    <ul className="space-y-4">
                        {[
                            { label: 'Patient Registry', link: '/login' },
                            { label: 'Specialist Directory', link: '/login' },
                            { label: 'Clinical Portal', link: '/login' },
                            { label: 'Triage Analytics', link: '/login' },
                            { label: 'Internal Support', link: '/login' }
                        ].map(link => (
                            <li key={link.label}>
                                <button onClick={() => router.push(link.link)} className="text-sm font-bold text-gray-400 hover:text-primary transition-colors text-left">{link.label}</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-dark uppercase tracking-[0.3em]">Institutional</h4>
                    <ul className="space-y-4">
                        {['About the Center', 'Medical Board', 'Health Authority', 'Clinical Research', 'Technical Specs'].map(link => (
                            <li key={link}>
                                <a href="#" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors">{link}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-dark uppercase tracking-[0.3em]">System Support</h4>
                    <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-dark mb-4">Operational Status</p>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">All Systems Operational</span>
                        </div>
                        <button className="w-full py-3 bg-white border border-gray-100 text-[10px] font-black text-dark uppercase tracking-widest rounded-xl hover:border-primary transition-all shadow-sm">Support Desk</button>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">&copy; {new Date().getFullYear()} FMC Institutional Portal</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-100"></div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Healthcare Excellence</div>
                </div>
                <div className="flex gap-10 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <a href="#" className="hover:text-dark transition-colors">Privacy</a>
                    <a href="#" className="hover:text-dark transition-colors">Terms</a>
                    <a href="#" className="hover:text-dark transition-colors">Security</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
