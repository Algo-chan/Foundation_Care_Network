'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  const navItems = [
    { id: 'dashboard', label: 'Overview', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'users', label: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'logs', label: 'Audit Logs', href: '/admin/audit-logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'hospitals', label: 'Hospitals', href: '/admin/hospitals', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'pharmacies', label: 'Pharmacies', href: '/admin/pharmacies', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.34a2 2 0 01-1.783 0l-.691-.34a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-.34.34a2 2 0 000 2.828l1.246 1.246a2 2 0 002.828 0l1.246-1.246a2 2 0 012.828 0l1.246 1.246a2 2 0 002.828 0l1.246-1.246a2 2 0 000-2.828l-.34-.34z' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-dark z-[70] lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white tracking-tighter">FCN Admin</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Portal</p>
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-primary font-bold mt-1">System Administrator</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-dark flex-col sticky top-0 h-screen shrink-0">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tighter">FCN Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="bg-white/5 p-4 rounded-2xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Portal</p>
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-primary font-bold mt-1">System Administrator</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 h-20 flex items-center px-4 md:px-8 justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-dark hover:bg-gray-100 rounded-xl lg:hidden transition-colors"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <h2 className="text-lg md:text-xl font-black text-dark tracking-tight">
                {navItems.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Admin'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/dashboard" className="hidden sm:block text-sm font-bold text-primary hover:underline">
              Go to Portal
            </Link>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
              <span className="text-primary font-black text-[10px] md:text-xs">
                {user.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
