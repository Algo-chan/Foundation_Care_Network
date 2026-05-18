'use client';

import { useEffect, useState, Suspense } from 'react';
import api from '@/utils/api';
import { useSearchParams } from 'next/navigation';

interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  role: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

const DOMAIN_MAP: Record<string, string> = {
  ADMIN: 'fcn.com',
  PATIENT: 'fcn-patient.com',
  DOCTOR: 'fcn-doctor.com',
  NURSE: 'fcn-nurse.com',
  RURAL_HO: 'fcn-ruralho.com'
};

function UserManagementContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus === 'pending' ? 'false' : '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '', emailPrefix: '', password: '', role: 'PATIENT' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isApproved = statusFilter;
      if (search) params.search = search;

      const response: any = await api.get('/admin/users', { params });
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const payload = {
        name: newUser.name,
        phone: newUser.phone || undefined,
        email: `${newUser.emailPrefix.toLowerCase()}@${DOMAIN_MAP[newUser.role]}`,
        password: newUser.password,
        role: newUser.role
      };
      
      const response: any = await api.post('/admin/users', payload);
      if (response.success) {
        setShowAddModal(false);
        setNewUser({ name: '', phone: '', emailPrefix: '', password: '', role: 'PATIENT' });
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response: any = await api.patch(`/admin/users/${id}/approve`);
      if (response.success) {
        setUsers(users.map(u => u.id === id ? { ...u, isApproved: true } : u));
      }
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response: any = await api.delete(`/admin/users/${id}`);
      if (response.success) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Search Users</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold text-dark"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold text-dark cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="PATIENT">Patient</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="RURAL_HO">Rural HO</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold text-dark cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending Approval</option>
          </select>
        </div>

        <button
          onClick={fetchUsers}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-primary/20 w-full md:w-auto"
        >
          Apply
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2.5 bg-dark text-white rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-dark/20 w-full md:w-auto"
        >
          Add User
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-dark tracking-tight">Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-dark">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-dark"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-dark cursor-pointer"
                >
                  <option value="PATIENT">Patient</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="RURAL_HO">Rural HO</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Email Identity</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="text"
                    value={newUser.emailPrefix}
                    onChange={e => {
                      const prefix = e.target.value.replace(/[^a-zA-Z0-9._-]/g, '');
                      setNewUser({...newUser, emailPrefix: prefix});
                    }}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-dark"
                    placeholder="username"
                  />
                  <div className="px-4 py-3 bg-gray-100 rounded-xl flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-200">
                    @{DOMAIN_MAP[newUser.role]}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-dark"
                  placeholder="+251..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Temporary Password</label>
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-sm text-dark"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                disabled={adding}
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 mt-4"
              >
                {adding ? 'Provisioning Account...' : 'Provision User Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-2xl font-bold text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User Identity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Institutional Role</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Registry Date</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-dark">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                    Syncing user registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                    No users matching your criteria.
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-black text-dark">{u.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold lowercase">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-gray-500 font-bold">{u.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className={`inline-block text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                        u.role === 'NURSE' ? 'bg-emerald-100 text-emerald-700' :
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'RURAL_HO' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${u.isApproved ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${u.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {u.isApproved ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-[11px] font-bold text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right space-x-3">
                    {!u.isApproved && (
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-lg"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-3 py-1 bg-rose-50 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-gray-400">Loading user management...</div>}>
      <UserManagementContent />
    </Suspense>
  );
}
