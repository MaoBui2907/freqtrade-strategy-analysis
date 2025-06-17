'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import BotTable from '@/components/bot-table';
import CreateBotModal from '@/components/create-bot-modal';
import { mockBots } from '@/lib/mock-data';
import { Bot } from '@/types';

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>(mockBots);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleToggleBot = (botId: string) => {
    setBots(prevBots =>
      prevBots.map(bot =>
        bot.id === botId
          ? { ...bot, status: bot.status === 'running' ? 'stopped' : 'running' }
          : bot
      )
    );
  };

  const handleDeleteBot = (botId: string) => {
    if (confirm('Are you sure you want to delete this bot?')) {
      setBots(prevBots => prevBots.filter(bot => bot.id !== botId));
    }
  };

  const handleCreateBot = (botData: { name: string; strategy: string; pairGroup: string }) => {
    const newBot: Bot = {
      id: `bot-${Date.now()}`,
      name: botData.name,
      status: 'stopped',
      strategy: botData.strategy,
      pairGroup: botData.pairGroup,
      todayPL: 0,
      totalPL: 0,
      winRate: 0,
      maxDrawdown: 0,
      avgTradeDuration: '0h 0m',
      equityData: [],
      trades: []
    };
    
    setBots(prevBots => [...prevBots, newBot]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bot Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create New Bot
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{bots.length}</div>
            <div className="text-sm text-gray-400">Total Bots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {bots.filter(bot => bot.status === 'running').length}
            </div>
            <div className="text-sm text-gray-400">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {bots.filter(bot => bot.status === 'stopped').length}
            </div>
            <div className="text-sm text-gray-400">Stopped</div>
          </div>
        </div>
      </div>

      <BotTable
        bots={bots}
        onToggleBot={handleToggleBot}
        onDeleteBot={handleDeleteBot}
      />

      <CreateBotModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBot={handleCreateBot}
      />
    </div>
  );
}