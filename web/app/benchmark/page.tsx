'use client';

import { mockBacktestResults } from '@/lib/mock-data';

export default function BenchmarkPage() {
  const results = mockBacktestResults;

  const metrics = [
    { name: 'Total P/L', key: 'totalPL', format: (value: number) => `$${value.toFixed(2)}` },
    { name: 'Win Rate', key: 'winRate', format: (value: number) => `${value.toFixed(1)}%` },
    { name: 'Max Drawdown', key: 'maxDrawdown', format: (value: number) => `${value.toFixed(1)}%` },
    { name: 'Total Trades', key: 'totalTrades', format: (value: number) => value.toString() },
    { name: 'Avg Trade Duration', key: 'avgTradeDuration', format: () => '2h 15m' },
    { name: 'Sharpe Ratio', key: 'sharpeRatio', format: () => '1.45' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Strategy Benchmark</h1>
        <div className="text-sm text-gray-400">
          Compare backtest results across strategies
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Performance Comparison</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Metric
                </th>
                {results.map((result, index) => (
                  <th key={result.id} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {result.strategy}
                    <div className="text-xs font-normal text-gray-500 mt-1">
                      {result.pairGroup}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {metrics.map((metric) => (
                <tr key={metric.name} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {metric.name}
                  </td>
                  {results.map((result) => {
                    const value = (result as any)[metric.key];
                    const isPositive = metric.key === 'totalPL' ? value > 0 : metric.key === 'winRate' ? value > 50 : false;
                    const colorClass = metric.key === 'totalPL' || metric.key === 'winRate' 
                      ? (isPositive ? 'text-green-400' : 'text-red-400')
                      : 'text-gray-300';
                    
                    return (
                      <td key={result.id} className={`px-6 py-4 whitespace-nowrap text-sm ${colorClass}`}>
                        {value !== undefined ? metric.format(value) : 'N/A'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">P/L Comparison</h3>
          <div className="space-y-4">
            {results.map((result, index) => {
              const maxPL = Math.max(...results.map(r => Math.abs(r.totalPL)));
              const width = Math.abs(result.totalPL) / maxPL * 100;
              const isPositive = result.totalPL > 0;
              
              return (
                <div key={result.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{result.strategy}</span>
                    <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                      ${result.totalPL.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Win Rate Comparison</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{result.strategy}</span>
                  <span className="text-blue-400">{result.winRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${result.winRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Benchmark Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Best Performer</h4>
            <p className="text-white font-semibold">Scalping Strategy</p>
            <p className="text-green-400 text-sm">+$1,847.32 Total P/L</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Highest Win Rate</h4>
            <p className="text-white font-semibold">Scalping Strategy</p>
            <p className="text-blue-400 text-sm">71.2% Win Rate</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Most Active</h4>
            <p className="text-white font-semibold">Scalping Strategy</p>
            <p className="text-yellow-400 text-sm">156 Total Trades</p>
          </div>
        </div>
      </div>
    </div>
  );
}