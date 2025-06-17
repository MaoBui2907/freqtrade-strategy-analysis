'use client';

import Link from 'next/link';
import { Bot } from '@/types';
import { Play, Square, Eye, Trash2 } from 'lucide-react';

interface BotTableProps {
  bots: Bot[];
  onToggleBot: (botId: string) => void;
  onDeleteBot: (botId: string) => void;
}

export default function BotTable({ bots, onToggleBot, onDeleteBot }: BotTableProps) {
  const formatPL = (pl: number) => {
    const sign = pl >= 0 ? '+' : '';
    const color = pl >= 0 ? 'text-green-400' : 'text-red-400';
    return { sign, color, value: Math.abs(pl) };
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Bot Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pair Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Today's P/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total P/L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {bots.map((bot) => {
              const todayPLStyle = formatPL(bot.todayPL);
              const totalPLStyle = formatPL(bot.totalPL);
              
              return (
                <tr key={bot.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{bot.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'running' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bot.strategy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bot.pairGroup}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${todayPLStyle.color}`}>
                    {bot.status === 'stopped' ? '-' : `${todayPLStyle.sign}$${todayPLStyle.value.toFixed(2)}`}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${totalPLStyle.color}`}>
                    {totalPLStyle.sign}${totalPLStyle.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/bots/${bot.id}`}
                        className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-gray-600"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => onToggleBot(bot.id)}
                        className={`p-1 rounded hover:bg-gray-600 ${
                          bot.status === 'running' 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                        title={bot.status === 'running' ? 'Stop Bot' : 'Start Bot'}
                      >
                        {bot.status === 'running' ? <Square size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={() => onDeleteBot(bot.id)}
                        className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-gray-600"
                        title="Delete Bot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}