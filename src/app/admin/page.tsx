'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import Link from 'next/link';

interface Stats {
  users: {
    total: number;
    doctors: number;
    nurses: number;
    patients: number;
    pendingApprovals: number;
  };
  entities: {
    hospitals: number;
    pharmacies: number;
  };
  recentLogs: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response: any = await api.get('/admin/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Loading system metrics...</div>;
  if (!stats) return <div>Failed to load stats</div>;

  const statCards = [
    { label: 'Total Users', value: stats.users.total, color: 'text-blue-600', sub: 'Active accounts' },
    { label: 'Doctors', value: stats.users.doctors, color: 'text-teal-600', sub: 'Verified specialists' },
    { label: 'Pending Approval', value: stats.users.pendingApprovals, color: 'text-amber-600', sub: 'Awaiting review', highlight: stats.users.pendingApprovals > 0 },
    { label: 'Hospitals', value: stats.entities.hospitals, color: 'text-purple-600', sub: 'Partner facilities' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`bg-white p-6 rounded-[2rem] border transition-all shadow-sm ${card.highlight ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{card.label}</p>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-black ${card.color} tracking-tight`}>{card.value.toLocaleString()}</p>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-2">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-dark">Recent Activity</h3>
            <Link href="/admin/audit-logs" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark truncate">
                    <span className="text-primary">{log.user.name}</span> {log.action.toLowerCase()} {log.entity}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentLogs.length === 0 && (
              <div className="p-10 text-center text-gray-400 font-medium italic">No recent activity found.</div>
            )}
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="space-y-6">
          <div className="bg-dark rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-xl font-black mb-4 relative z-10">Quick Actions</h3>
            <div className="space-y-3 relative z-10">
              <Link href="/admin/users?status=pending" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10 group">
                <span className="text-sm font-bold">Review Approvals</span>
                <span className="bg-primary px-2 py-0.5 rounded-full text-[10px] font-black">{stats.users.pendingApprovals}</span>
              </Link>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
                <span className="text-sm font-bold">System Status</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Support Hub</h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                As a system administrator, you have full access to manage users, hospitals, and pharmacies.
              </p>
              <button className="text-sm font-black text-primary hover:text-primary-dark flex items-center gap-2">
                Download Audit Report
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
