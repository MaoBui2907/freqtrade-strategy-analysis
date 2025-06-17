import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  adaptStrategy, 
  adaptPairGroup, 
  adaptBacktestResult,
  adaptTimeframe 
} from '@/lib/adapters';
import { Strategy, PairGroup, BacktestResult } from '@/types';
import { 
  BacktestingRequest, 
  StrategyResponse, 
  PairGroupResponse,
  BacktestingResponse,
  StrategyPerformance 
} from '@/lib/api-client';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for fetching strategies
export function useStrategies() {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getStrategies()
  );

  const strategies: Strategy[] = data ? data.map(adaptStrategy) : [];
  
  return { strategies, loading, error, refetch };
}

// Hook for fetching a single strategy
export function useStrategy(id: string) {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getStrategy(id),
    [id]
  );

  const strategy: Strategy | null = data ? adaptStrategy(data) : null;
  
  return { strategy, loading, error, refetch };
}

// Hook for fetching pair groups
export function usePairGroups() {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getPairGroups()
  );

  const pairGroups: PairGroup[] = data ? data.map(adaptPairGroup) : [];
  
  return { pairGroups, loading, error, refetch };
}

// Hook for fetching available pairs
export function usePairs() {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getPairs()
  );

  // Convert API PairResponse to simple string array for UI
  const pairs: string[] = data ? data.map(pair => pair.name) : [];
  
  return { pairs, loading, error, refetch };
}

// Hook for fetching backtesting results
export function useBacktestings() {
  const { data, loading, error, refetch } = useApiCall(
    () => apiClient.getBacktestings()
  );

  const backtestings: BacktestingResponse[] = data || [];
  
  return { backtestings, loading, error, refetch };
}

// Hook for creating and running backtests
export function useBacktesting() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  // Helper function to find pair group ID by name
  const findPairGroupId = async (pairGroupName: string): Promise<string> => {
    const pairGroups = await apiClient.getPairGroups();
    const found = pairGroups.find(pg => pg.name === pairGroupName);
    if (!found) {
      throw new Error(`Pair group '${pairGroupName}' not found`);
    }
    return found.id;
  };

  // Helper function to find strategy ID by name
  const findStrategyId = async (strategyName: string): Promise<string> => {
    try {
      const strategies = await apiClient.getStrategies();
      const found = strategies.find(s => s.name === strategyName);
      
      if (!found) {
        throw new Error(`Strategy '${strategyName}' not found`);
      }
      
      return found.id;
    } catch (err) {
      throw new Error(`Failed to find strategy '${strategyName}': ${err}`);
    }
  };

  const runBacktest = useCallback(async (
    strategy: string,
    pairGroup: string,
    timeRange: string,
    timeframe: string = '1h'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert time range to dates
      const { start_date, end_date } = adaptTimeframe(timeRange);
      
      // Lookup actual IDs
      const pairGroupId = await findPairGroupId(pairGroup);
      const strategyId = await findStrategyId(strategy);
      
      const backtestRequest: BacktestingRequest = {
        name: `${strategy} - ${pairGroup} - ${timeRange}`,
        start_date,
        end_date,
        timeframe: timeframe as any,
        pair_group_id: pairGroupId,
        strategy_id: strategyId
      };

      // Create backtest and return immediately
      const backtestId = await apiClient.createBacktesting(backtestRequest);
      setResult(backtestId);
      
      return backtestId; // Return the backtest ID immediately
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run backtest');
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  return { runBacktest, loading, error, result };
}

// Hook for AI strategy queries
export function useStrategyAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryAI = useCallback(async (
    strategyId: string,
    query: string,
    queryType: 'analyze' | 'explain' | 'improve' | 'review' = 'analyze'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.queryStrategyAI(strategyId, {
        query,
        query_type: queryType
      });
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI query failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { queryAI, loading, error };
}

// Hook for creating pair groups
export function usePairGroupMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPairGroup = useCallback(async (
    name: string,
    description: string,
    pairs: string[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.createPairGroup({
        name,
        description,
        pairs
      });
      
      return adaptPairGroup(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pair group';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePairGroup = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.deletePairGroup(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pair group';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { createPairGroup, deletePairGroup, loading, error };
} 