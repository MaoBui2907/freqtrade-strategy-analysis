'use client';

import { Trade } from '@/types';

interface TradeHistoryTableProps {
  trades: Trade[];
  title?: string;
}

export default function TradeHistoryTable({ trades, title = "Trade History" }: TradeHistoryTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPL = (pl: number) => {
    const sign = pl >= 0 ? '+' : '';
    const color = pl >= 0 ? 'text-green-400' : 'text-red-400';
    return { sign, color };
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Pair
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Open Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Close Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P/L (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P/L (USDT)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {trades.slice(0, 20).map((trade) => {
              const plPercentStyle = formatPL(trade.plPercent);
              const plQuoteStyle = formatPL(trade.plQuote);
              
              return (
                <tr key={trade.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {trade.pair}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.direction === 'long' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.direction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(trade.openTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(trade.closeTime)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${plPercentStyle.color}`}>
                    {plPercentStyle.sign}{trade.plPercent.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${plQuoteStyle.color}`}>
                    {plQuoteStyle.sign}${trade.plQuote.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {trades.length > 20 && (
        <div className="px-6 py-4 bg-gray-900 text-center">
          <p className="text-sm text-gray-400">
            Showing 20 of {trades.length} trades
          </p>
        </div>
      )}
    </div>
  );
}