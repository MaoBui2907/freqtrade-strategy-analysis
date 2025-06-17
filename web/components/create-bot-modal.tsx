'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { mockStrategies, mockPairGroups } from '@/lib/mock-data';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBot: (botData: { name: string; strategy: string; pairGroup: string }) => void;
}

export default function CreateBotModal({ isOpen, onClose, onCreateBot }: CreateBotModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    strategy: '',
    pairGroup: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.strategy || !formData.pairGroup) {
      return;
    }

    onCreateBot(formData);
    setFormData({ name: '', strategy: '', pairGroup: '' });
    onClose();
  };

  const handleClose = () => {
    setFormData({ name: '', strategy: '', pairGroup: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create New Bot</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="botName" className="block text-sm font-medium text-gray-300 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              id="botName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter bot name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-2">
              Strategy
            </label>
            <select
              id="strategy"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a strategy</option>
              {mockStrategies.map((strategy) => (
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a pair group</option>
              {mockPairGroups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Bot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}