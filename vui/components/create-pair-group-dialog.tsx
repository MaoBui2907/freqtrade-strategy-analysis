'use client';

import { useState } from 'react';
import { X, Plus, Check, Search, Loader2 } from 'lucide-react';
import { usePairs, usePairGroupMutations } from '@/hooks/use-api';

interface CreatePairGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePairGroupDialog({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreatePairGroupDialogProps) {
  const { pairs, loading: pairsLoading, error: pairsError } = usePairs();
  const { createPairGroup, loading: creating, error: createError } = usePairGroupMutations();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pairs: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredPairs = pairs.filter(pair =>
    pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.pairs.length === 0) {
      newErrors.pairs = 'At least one pair must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createPairGroup(formData.name, formData.description, formData.pairs);
      
      // Reset form
      setFormData({ name: '', description: '', pairs: [] });
      setSearchTerm('');
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create pair group:', error);
    }
  };

  const togglePair = (pair: string) => {
    setFormData(prev => ({
      ...prev,
      pairs: prev.pairs.includes(pair)
        ? prev.pairs.filter(p => p !== pair)
        : [...prev.pairs, pair]
    }));
    
    // Clear pairs error when user selects a pair
    if (errors.pairs) {
      setErrors(prev => ({ ...prev, pairs: '' }));
    }
  };

  const selectAllFiltered = () => {
    const uniquePairs = Array.from(new Set([...formData.pairs, ...filteredPairs]));
    setFormData(prev => ({ ...prev, pairs: uniquePairs }));
  };

  const clearSelection = () => {
    setFormData(prev => ({ ...prev, pairs: [] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create Pair Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="e.g., Major Pairs"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-600'
              }`}
              rows={3}
              placeholder="Describe the purpose of this pair group..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Pairs Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Pairs * ({formData.pairs.length} selected)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Select All Filtered
                </button>
                <span className="text-gray-500">|</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pairs List */}
            <div className={`border rounded-md max-h-64 overflow-y-auto ${
              errors.pairs ? 'border-red-500' : 'border-gray-600'
            }`}>
              {pairsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-300">Loading pairs...</span>
                </div>
              ) : pairsError ? (
                <div className="p-4 text-center text-red-400">
                  Error loading pairs: {pairsError}
                </div>
              ) : filteredPairs.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {searchTerm ? `No pairs found matching "${searchTerm}"` : 'No pairs available'}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredPairs.map((pair) => (
                    <div
                      key={pair}
                      onClick={() => togglePair(pair)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        formData.pairs.includes(pair)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-sm font-mono">{pair}</span>
                      {formData.pairs.includes(pair) && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {errors.pairs && (
              <p className="mt-1 text-sm text-red-400">{errors.pairs}</p>
            )}
          </div>

          {/* Create Error */}
          {createError && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded-md">
              <p className="text-red-300 text-sm">{createError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || pairsLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 