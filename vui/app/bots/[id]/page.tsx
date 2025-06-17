'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Square } from 'lucide-react';
import StatCard from '@/components/stat-card';
import PerformanceChart from '@/components/performance-chart';
import TradeHistoryTable from '@/components/trade-history-table';
import { mockBots } from '@/lib/mock-data';

export default function BotDetailPage() {
  const params = useParams();
  const botId = params.id as string;
  
  const bot = mockBots.find(b => b.id === botId);

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Bot Not Found</h2>
          <p className="text-gray-400 mb-4">The requested bot could not be found.</p>
          <Link
            href="/bots"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Bots
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/bots"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
            <p className="text-gray-400 mt-1">
              {bot.strategy} • {bot.pairGroup}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-2 rounded-full text-sm font-medium ${
            bot.status === 'running' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-gray-600 text-gray-300'
          }`}>
            {bot.status}
          </span>
          <button
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              bot.status === 'running'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {bot.status === 'running' ? (
              <>
                <Square size={16} className="mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Start Bot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total P/L"
          value={bot.totalPL}
          prefix="$"
          change={bot.totalPL > 0 ? 5.2 : -2.1}
        />
        <StatCard
          title="Win Rate"
          value={bot.winRate}
          suffix="%"
        />
        <StatCard
          title="Max Drawdown"
          value={bot.maxDrawdown}
          suffix="%"
        />
        <StatCard
          title="Avg. Trade Duration"
          value={bot.avgTradeDuration}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceChart
        data={bot.equityData}
        height={400}
        title="Bot Performance (Equity Curve)"
      />

      {/* Trade History */}
      <TradeHistoryTable trades={bot.trades} />
    </div>
  );
}