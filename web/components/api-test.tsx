'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiStatus {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function ApiTest() {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    { endpoint: '/strategies', status: 'loading' },
    { endpoint: '/pair-groups', status: 'loading' },
    { endpoint: '/strategy-groups', status: 'loading' },
    { endpoint: '/backtestings', status: 'loading' }
  ]);

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = [
        { name: '/strategies', test: () => apiClient.getStrategies() },
        { name: '/pair-groups', test: () => apiClient.getPairGroups() },
        { name: '/strategy-groups', test: () => apiClient.getStrategyGroups() },
        { name: '/backtestings', test: () => apiClient.getBacktestings() }
      ];

      for (const endpoint of endpoints) {
        try {
          const data = await endpoint.test();
          setApiStatuses(prev => prev.map(status => 
            status.endpoint === endpoint.name 
              ? { 
                  ...status, 
                  status: 'success', 
                  message: `${Array.isArray(data) ? data.length : 'Data'} items found`,
                  data 
                }
              : status
          ));
        } catch (error) {
          setApiStatuses(prev => prev.map(status => 
            status.endpoint === endpoint.name 
              ? { 
                  ...status, 
                  status: 'error', 
                  message: error instanceof Error ? error.message : 'Unknown error' 
                }
              : status
          ));
        }
      }
    };

    testEndpoints();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">API Connection Status</h3>
      <div className="space-y-3">
        {apiStatuses.map((status) => (
          <div key={status.endpoint} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {status.status === 'loading' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {status.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {status.status === 'error' && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-white font-mono text-sm">{status.endpoint}</span>
            </div>
            <div className="text-right">
              <div className={`text-sm ${
                status.status === 'success' ? 'text-green-400' :
                status.status === 'error' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {status.status === 'loading' ? 'Testing...' : status.message}
              </div>
              {status.data && Array.isArray(status.data) && (
                <div className="text-xs text-gray-500">
                  {status.data.length} records
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 