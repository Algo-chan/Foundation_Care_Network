'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function LabResultsPage() {
  const { user } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }
    fetchLabResults();
  }, [user]);

  const fetchLabResults = async () => {
    try {
      const response: any = await api.get('/lab/my');
      if (response.success) {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch lab results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-dark mb-8">Laboratory Results</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading diagnostic data...</p>
        ) : results.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500">No laboratory records found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-dark">{r.testName}</h3>
                  <p className="text-sm text-gray-500 mb-2">Ordered by {r.doctor.user.name} on {new Date(r.orderedAt).toLocaleDateString()}</p>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status}
                    </span>
                    {r.status === 'COMPLETED' && (
                        <p className="text-lg font-bold text-primary">
                            {r.resultValue} <span className="text-xs font-normal text-gray-400">{r.unit}</span>
                        </p>
                    )}
                  </div>
                </div>
                {r.status === 'COMPLETED' && (
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-md hover:bg-gray-200">
                    Download Report
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

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
