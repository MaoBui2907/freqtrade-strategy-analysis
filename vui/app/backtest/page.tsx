'use client';

import { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { useStrategies, usePairGroups, useBacktesting, useBacktestings } from '@/hooks/use-api';
import { BacktestingResponse, StrategyPerformance } from '@/lib/api-client';
import { apiClient } from '@/lib/api-client';

export default function BacktestPage() {
  const { strategies, loading: strategiesLoading, error: strategiesError } = useStrategies();
  const { pairGroups, loading: pairGroupsLoading, error: pairGroupsError } = usePairGroups();
  const { runBacktest, loading: backtestLoading, error: backtestError, result } = useBacktesting();
  const { backtestings, loading: backtestingsLoading, error: backtestingsError, refetch: refetchBacktestings } = useBacktestings();
  
  const [formData, setFormData] = useState({
    strategy: '',
    pairGroup: '',
    timeRange: '',
    timeframe: '1h'
  });

  // Dialog state for viewing performance
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestingResponse | null>(null);
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false);
  const [performanceData, setPerformanceData] = useState<StrategyPerformance[]>([]);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Auto-refresh backtestings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchBacktestings();
    }, 30 * 1000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchBacktestings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.strategy || !formData.pairGroup || !formData.timeRange || !formData.timeframe) {
      return;
    }

    try {
      // Run backtest and get the ID immediately
      const backtestId = await runBacktest(formData.strategy, formData.pairGroup, formData.timeRange, formData.timeframe);
      
      // Refresh backtestings list immediately to show the new backtest
      refetchBacktestings();
      
      // Reset form after successful creation
      setFormData({
        strategy: '',
        pairGroup: '',
        timeRange: '',
        timeframe: '1h'
      });
      
    } catch (error) {
      // Error is already handled by the hook, just log it
      console.error('Failed to create backtest:', error);
    }
  };

  const handleViewPerformance = async (backtest: BacktestingResponse) => {
    if (backtest.status !== 'completed') {
      return;
    }

    setSelectedBacktest(backtest);
    setLoadingPerformance(true);
    setShowPerformanceDialog(true);

    try {
      const performance = await apiClient.getBacktestingPerformance(backtest.id);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      setPerformanceData([]);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900 text-green-300';
      case 'processing': return 'bg-blue-900 text-blue-300';
      case 'failed': return 'bg-red-900 text-red-300';
      default: return 'bg-yellow-900 text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return '✓';
      case 'failed': return '✗';
      default: return '⏳';
    }
  };

  const isLoading = strategiesLoading || pairGroupsLoading;
  const hasError = strategiesError || pairGroupsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-300">Loading data...</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load data</h3>
          <p className="text-gray-400 mb-4">{strategiesError || pairGroupsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Backtesting</h1>
        <div className="text-sm text-gray-400">
          Test your strategies with historical data
        </div>
      </div>

      {/* Backtest Configuration */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Configure Backtest</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-2">
              Strategy
            </label>
            <select
              id="strategy"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Strategy</option>
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.name}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="pairGroup" className="block text-sm font-medium text-gray-300 mb-2">
              Pair Group
            </label>
            <select
              id="pairGroup"
              value={formData.pairGroup}
              onChange={(e) => setFormData({ ...formData, pairGroup: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Pair Group</option>
              {pairGroups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="timeRange" className="block text-sm font-medium text-gray-300 mb-2">
              Time Range
            </label>
            <select
              id="timeRange"
              value={formData.timeRange}
              onChange={(e) => setFormData({ ...formData, timeRange: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Time Range</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 90 days">Last 90 days</option>
              <option value="Last 6 months">Last 6 months</option>
              <option value="Last 1 year">Last 1 year</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-gray-300 mb-2">
              Timeframe
            </label>
            <select
              id="timeframe"
              value={formData.timeframe}
              onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="1m">1 Minute</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="8h">8 Hours</option>
              <option value="1d">1 Day</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={backtestLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {backtestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Run Backtest
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Show backtest error if any */}
        {backtestError && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-300">{backtestError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Backtestings Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Backtest History</h2>
          <button
            onClick={refetchBacktestings}
            disabled={backtestingsLoading}
            className="flex items-center px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${backtestingsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {backtestingsError ? (
          <div className="p-6">
            <div className="flex items-center text-red-400">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Failed to load backtestings: {backtestingsError}</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Timeframe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {backtestingsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                        <span className="text-gray-300">Loading backtestings...</span>
                      </div>
                    </td>
                  </tr>
                ) : backtestings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No backtestings found. Create your first backtest above.
                    </td>
                  </tr>
                ) : (
                  backtestings.map((backtest) => (
                    <tr key={backtest.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{backtest.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backtest.status)}`}>
                            <span className="mr-1">{getStatusIcon(backtest.status)}</span>
                            {backtest.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backtest.start_date} to {backtest.end_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backtest.timeframe}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewPerformance(backtest)}
                          disabled={backtest.status !== 'completed'}
                          className="flex items-center text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                          <Eye size={16} className="mr-1" />
                          View Performance
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Dialog */}
      {showPerformanceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedBacktest?.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedBacktest?.start_date} to {selectedBacktest?.end_date} • {selectedBacktest?.timeframe}
                </p>
              </div>
              <button
                onClick={() => setShowPerformanceDialog(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingPerformance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                  <span className="text-gray-300">Loading performance data...</span>
                </div>
              ) : performanceData.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No performance data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Performance Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {performanceData.map((perf) => (
                      <div key={perf.id} className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">{perf.strategy_name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Trades:</span>
                            <span className="text-white">{perf.total_trades}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Rate:</span>
                            <span className="text-white">{((perf.wins / perf.total_trades) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Profit:</span>
                            <span className={`${perf.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${perf.profit.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max Drawdown:</span>
                            <span className="text-red-400">${perf.max_drawdown.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Performance Table */}
                  <div className="bg-gray-700 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-600">
                      <h4 className="text-lg font-medium text-white">Detailed Performance</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Strategy</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Wins</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Losses</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Draws</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Trades</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Profit</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Profit %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {performanceData.map((perf) => (
                            <tr key={perf.id}>
                              <td className="px-4 py-3 text-sm text-white">{perf.strategy_name}</td>
                              <td className="px-4 py-3 text-sm text-green-400">{perf.wins}</td>
                              <td className="px-4 py-3 text-sm text-red-400">{perf.losses}</td>
                              <td className="px-4 py-3 text-sm text-gray-300">{perf.draws}</td>
                              <td className="px-4 py-3 text-sm text-white">{perf.total_trades}</td>
                              <td className={`px-4 py-3 text-sm ${perf.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${perf.profit.toFixed(2)}
                              </td>
                              <td className={`px-4 py-3 text-sm ${perf.profit_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {perf.profit_percentage.toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}