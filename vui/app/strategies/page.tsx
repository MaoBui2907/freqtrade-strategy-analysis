'use client';

import { useStrategies } from '@/hooks/use-api';
import { Target, Loader2, AlertCircle } from 'lucide-react';

export default function StrategiesPage() {
  const { strategies, loading, error, refetch } = useStrategies();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-300">Loading strategies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load strategies</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Trading Strategies</h1>
        <div className="text-sm text-gray-400">
          {strategies.length} strategies available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Target size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">
              {strategy.description}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Strategy Type
              </div>
              <div className="text-xs text-blue-400 font-medium">
                Technical Analysis
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Performance Metrics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Strategy Performance Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-400">Strategy</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Active Bots</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Avg Win Rate</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Total P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="py-3 text-white">Scalping Strategy</td>
                <td className="py-3 text-gray-300">1</td>
                <td className="py-3 text-green-400">68.5%</td>
                <td className="py-3 text-green-400">+$2,847.91</td>
              </tr>
              <tr>
                <td className="py-3 text-white">Momentum Strategy</td>
                <td className="py-3 text-gray-300">1</td>
                <td className="py-3 text-green-400">72.1%</td>
                <td className="py-3 text-green-400">+$1,234.67</td>
              </tr>
              <tr>
                <td className="py-3 text-white">Grid Strategy</td>
                <td className="py-3 text-gray-300">1</td>
                <td className="py-3 text-green-400">75.3%</td>
                <td className="py-3 text-green-400">+$3,456.78</td>
              </tr>
              <tr>
                <td className="py-3 text-white">Breakout Strategy</td>
                <td className="py-3 text-gray-300">0</td>
                <td className="py-3 text-yellow-400">58.9%</td>
                <td className="py-3 text-green-400">+$892.14</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}