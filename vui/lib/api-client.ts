// Freqtrade Strategy Analysis API Client
// Adapted for Next.js environment

export interface BacktestingRequest {
  name: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
  timeframe: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "8h" | "1d";
  pair_group_id: string;
  strategy_id: string;
}

export interface BacktestingResponse {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  start_date: string;
  end_date: string;
  pair_group_id: string;
  timeframe: string;
  strategy_id: string;
}

export interface PairGroupRequest {
  name: string;
  description: string;
  pairs: string[]; // e.g., ["BTC/USDT", "ETH/USDT"]
}

export interface PairGroupResponse {
  id: string;
  name: string;
  description: string;
  pairs: string[];
}

export interface PairResponse {
  id: string;
  name: string;
  description: string;
}

export interface StrategyResponse {
  id: string;
  name: string;
  filename: string;
  description: string;
  explanation?: string;
  indicators?: string[];
  example?: string;
  content?: string;
}

export interface StrategyUpdateRequest {
  name: string;
  description: string;
  explanation: string;
  indicators: string[];
  example: string;
}

export interface StrategyGroupRequest {
  name: string;
  strategies: string[];
  description: string;
}

export interface StrategyGroupResponse {
  id: string;
  name: string;
  strategies: string[];
  description: string;
}

export interface StrategyPerformance {
  id: string;
  strategy_id: string;
  strategy_name: string;
  start_date: string;
  end_date: string;
  wins: number;
  losses: number;
  draws: number;
  total_trades: number;
  trade_per_day: number;
  profit: number;
  final_balance: number;
  max_drawdown: number;
  profit_percentage: number;
}

export interface AIQueryRequest {
  query: string;
  query_type: "analyze" | "explain" | "improve" | "review";
  content?: string; // optional
}

export interface AIQueryResponse {
  response: string;
  analysis: string;
}

export interface ApiError {
  detail: string;
}

// API Client Class
export class FreqtradeApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use environment variable or default to localhost
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1998';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const error: ApiError = await response.json();
          errorMessage = error.detail || errorMessage;
        } catch {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Backtesting APIs
  async getBacktestings(): Promise<BacktestingResponse[]> {
    return this.request<BacktestingResponse[]>('/backtestings');
  }

  async createBacktesting(data: BacktestingRequest): Promise<string> {
    return this.request<string>('/backtestings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBacktestingPerformance(id: string): Promise<StrategyPerformance[]> {
    return this.request<StrategyPerformance[]>(`/backtestings/${id}/performances`);
  }

  // Pair Groups APIs
  async getPairGroups(): Promise<PairGroupResponse[]> {
    return this.request<PairGroupResponse[]>('/pair-groups');
  }

  async createPairGroup(data: PairGroupRequest): Promise<PairGroupResponse> {
    return this.request<PairGroupResponse>('/pair-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePairGroup(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/pair-groups/${id}`, {
      method: 'DELETE',
    });
  }

  async getPairs(): Promise<PairResponse[]> {
    return this.request<PairResponse[]>('/pair-groups/pairs');
  }

  // Strategies APIs
  async getStrategies(): Promise<StrategyResponse[]> {
    return this.request<StrategyResponse[]>('/strategies');
  }

  async getStrategy(id: string): Promise<StrategyResponse> {
    return this.request<StrategyResponse>(`/strategies/${id}`);
  }

  async updateStrategy(id: string, data: StrategyUpdateRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/strategies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async queryStrategyAI(
    id: string, 
    data: AIQueryRequest
  ): Promise<AIQueryResponse> {
    return this.request<AIQueryResponse>(`/strategies/${id}/ai-query`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Strategy Groups APIs
  async getStrategyGroups(): Promise<StrategyGroupResponse[]> {
    return this.request<StrategyGroupResponse[]>('/strategy-groups');
  }

  async getStrategyGroup(id: string): Promise<StrategyGroupResponse> {
    return this.request<StrategyGroupResponse>(`/strategy-groups/${id}`);
  }

  async createStrategyGroup(data: StrategyGroupRequest): Promise<StrategyGroupResponse> {
    return this.request<StrategyGroupResponse>('/strategy-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStrategyGroup(
    id: string, 
    data: StrategyGroupRequest
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/strategy-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStrategyGroup(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/strategy-groups/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new FreqtradeApiClient(); 