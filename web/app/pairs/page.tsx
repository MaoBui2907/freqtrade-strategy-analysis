'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { usePairGroups, usePairs, usePairGroupMutations } from '@/hooks/use-api';
import CreatePairGroupDialog from '@/components/create-pair-group-dialog';

export default function PairsPage() {
  const { pairGroups, loading, error, refetch } = usePairGroups();
  const { pairs: allAvailablePairs, loading: pairsLoading } = usePairs();
  const { deletePairGroup, loading: mutationLoading } = usePairGroupMutations();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredPairs = allAvailablePairs.filter((pair: string) =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteGroup = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pair group?')) {
      try {
        await deletePairGroup(id);
        refetch(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete pair group:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    refetch(); // Refresh the pair groups list
  };

  if (loading || pairsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-300">Loading pair groups...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load pair groups</h3>
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
        <h1 className="text-3xl font-bold text-white">Pair Management</h1>
        <button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Pair Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pair Groups */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Pair Groups</h2>
          </div>
          <div className="p-6 space-y-4">
            {pairGroups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-white">{group.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit Group"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Group"
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={mutationLoading}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-3">
                  {group.pairs.length} pairs
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.pairs.slice(0, 3).map((pair) => (
                    <span
                      key={pair}
                      className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                    >
                      {pair}
                    </span>
                  ))}
                  {group.pairs.length > 3 && (
                    <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                      +{group.pairs.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Available Pairs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">All Available Pairs</h2>
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {filteredPairs.map((pair: string) => (
                <div
                  key={pair}
                  className="flex items-center justify-between p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  <span className="text-white text-sm">{pair}</span>
                  <button
                    className="text-blue-400 hover:text-blue-300 text-xs"
                    title="Add to Group"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
            {filteredPairs.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No pairs found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pair Statistics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Pair Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{allAvailablePairs.length}</div>
            <div className="text-sm text-gray-400">Total Pairs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{pairGroups.length}</div>
            <div className="text-sm text-gray-400">Pair Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">12</div>
            <div className="text-sm text-gray-400">Active Pairs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">8</div>
            <div className="text-sm text-gray-400">High Volume</div>
          </div>
        </div>
      </div>

      {/* Create Pair Group Dialog */}
      <CreatePairGroupDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}