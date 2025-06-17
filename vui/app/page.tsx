'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/stat-card';
import PerformanceChart from '@/components/performance-chart';
import ApiTest from '@/components/api-test';
import { mockPortfolioStats } from '@/lib/mock-data';
import { Bot, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdated}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bots Running"
          value={mockPortfolioStats.totalBotsRunning}
          icon={<Bot size={24} />}
        />
        <StatCard
          title="Total P/L (24h)"
          value={mockPortfolioStats.totalPL24h}
          prefix="$"
          change={5.2}
          icon={<TrendingUp size={24} />}
        />
        <StatCard
          title="Portfolio Value"
          value={mockPortfolioStats.totalValue}
          prefix="$"
          change={2.8}
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Most Profitable Strategy"
          value={mockPortfolioStats.mostProfitableStrategy}
          icon={<Activity size={24} />}
        />
      </div>

      {/* Portfolio Performance Chart */}
      <div className="mt-8">
        <PerformanceChart
          data={mockPortfolioStats.portfolioData}
          height={400}
          title="Portfolio Performance (30 Days)"
        />
      </div>

      {/* API Connection Test */}
      <ApiTest />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Bots:</span>
              <span className="text-white font-medium">{mockPortfolioStats.totalBotsRunning}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Trades Today:</span>
              <span className="text-white font-medium">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Win Rate:</span>
              <span className="text-green-400 font-medium">68.1%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Best Performing Bot:</span>
              <span className="text-white font-medium">BTC Scalper Pro</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Market Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">BTC/USDT:</span>
              <span className="text-green-400 font-medium">$45,230.50 (+2.3%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ETH/USDT:</span>
              <span className="text-green-400 font-medium">$2,845.60 (+1.8%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Market Sentiment:</span>
              <span className="text-green-400 font-medium">Bullish</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Volatility:</span>
              <span className="text-yellow-400 font-medium">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}