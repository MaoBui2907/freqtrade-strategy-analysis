# Freqtrade API Integration Guide

## Tổng quan

Hệ thống Freqtrade Strategy Analysis cung cấp REST API để quản lý strategies, backtesting, và phân tích performance. API được xây dựng bằng FastAPI và MongoDB.

## Files tài liệu

1. **`API_DOCUMENTATION.md`** - Tài liệu API chi tiết với tất cả endpoints
2. **`api-types.ts`** - TypeScript interfaces và API client class
3. **`API_INTEGRATION_GUIDE.md`** - File này, hướng dẫn integration

## Cách sử dụng

### 1. Sử dụng với TypeScript/JavaScript

#### Copy file `api-types.ts` vào project của bạn:
```bash
# Copy vào src/services/ hoặc src/api/
cp api-types.ts your-project/src/services/
```

#### Import và sử dụng:
```typescript
import { apiClient, BacktestingRequest } from './services/api-types';

// Fetch data
const loadBacktestings = async () => {
  try {
    const backtestings = await apiClient.getBacktestings();
    setBacktestings(backtestings);
  } catch (error) {
    console.error('Failed to load backtestings:', error);
  }
};
```

### 2. Sử dụng với React

#### Hook example:
```typescript
import { useState, useEffect } from 'react';
import { apiClient, BacktestingResponse } from '../services/api-types';

export const useBacktestings = () => {
  const [backtestings, setBacktestings] = useState<BacktestingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBacktestings = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getBacktestings();
        setBacktestings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchBacktestings();
  }, []);

  return { backtestings, loading, error };
};
```

### 3. Sử dụng với Vue.js

#### Composable example:
```typescript
import { ref, onMounted } from 'vue';
import { apiClient, StrategyResponse } from '../services/api-types';

export const useStrategies = () => {
  const strategies = ref<StrategyResponse[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const fetchStrategies = async () => {
    try {
      loading.value = true;
      strategies.value = await apiClient.getStrategies();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchStrategies);

  return {
    strategies,
    loading,
    error,
    refetch: fetchStrategies
  };
};
```

### 4. Sử dụng với Angular

#### Service example:
```typescript
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { apiClient, PairGroupResponse } from '../services/api-types';

@Injectable({
  providedIn: 'root'
})
export class FreqtradeService {
  getPairGroups(): Observable<PairGroupResponse[]> {
    return from(apiClient.getPairGroups());
  }

  createPairGroup(data: PairGroupRequest): Observable<PairGroupResponse> {
    return from(apiClient.createPairGroup(data));
  }
}
```

## Workflow thông thường

### 1. Tạo và chạy Backtesting

```typescript
// 1. Lấy danh sách pair groups và strategy groups
const pairGroups = await apiClient.getPairGroups();
const strategyGroups = await apiClient.getStrategyGroups();

// 2. Tạo backtesting mới
const backtestingRequest: BacktestingRequest = {
  name: "BTC Strategy Test",
  start_date: "2024-01-01",
  end_date: "2024-01-31",
  timeframe: "1h",
  pair_group_id: pairGroups[0].id,
  strategy_group_id: strategyGroups[0].id
};

const backtestingId = await apiClient.createBacktesting(backtestingRequest);

// 3. Poll để check status (backtesting chạy async)
const pollBacktestingStatus = async (id: string) => {
  const backtestings = await apiClient.getBacktestings();
  const backtesting = backtestings.find(b => b.id === id);
  
  if (backtesting?.status === 'completed') {
    // 4. Lấy kết quả performance
    const performances = await apiClient.getBacktestingPerformance(id);
    return performances;
  } else if (backtesting?.status === 'failed') {
    throw new Error('Backtesting failed');
  }
  
  // Continue polling...
  setTimeout(() => pollBacktestingStatus(id), 5000);
};
```

### 2. Quản lý Strategies

```typescript
// Lấy danh sách strategies
const strategies = await apiClient.getStrategies();

// Xem chi tiết strategy
const strategy = await apiClient.getStrategy(strategies[0].id);

// Update strategy
await apiClient.updateStrategy(strategy.id, {
  name: strategy.name,
  description: "Updated description",
  explanation: strategy.explanation || "",
  indicators: strategy.indicators || [],
  example: strategy.example || ""
});

// AI Query cho strategy
const aiResponse = await apiClient.queryStrategyAI(strategy.id, {
  query: "Explain this strategy logic",
  query_type: "explain"
});
```

### 3. Quản lý Pair Groups

```typescript
// Tạo pair group mới
const newPairGroup = await apiClient.createPairGroup({
  name: "Major Crypto Pairs",
  description: "Top cryptocurrency trading pairs",
  pairs: ["BTC/USDT", "ETH/USDT", "BNB/USDT"]
});

// Lấy danh sách pairs có sẵn
const availablePairs = await apiClient.getPairs();
```

## Error Handling

### Global Error Handler
```typescript
// Tạo wrapper function để handle errors globally
const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof Error) {
      // Log error
      console.error('API Error:', error.message);
      
      // Show user-friendly message
      if (error.message.includes('404')) {
        alert('Dữ liệu không tồn tại');
      } else if (error.message.includes('422')) {
        alert('Dữ liệu đầu vào không hợp lệ');
      } else {
        alert('Có lỗi xảy ra, vui lòng thử lại');
      }
    }
    return null;
  }
};

// Usage
const backtestings = await handleApiCall(() => apiClient.getBacktestings());
if (backtestings) {
  // Handle success
}
```

## Loading States

### React example với loading states:
```typescript
const BacktestingList = () => {
  const [backtestings, setBacktestings] = useState<BacktestingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreateBacktesting = async (data: BacktestingRequest) => {
    setCreating(true);
    try {
      const id = await apiClient.createBacktesting(data);
      // Refresh list
      const updated = await apiClient.getBacktestings();
      setBacktestings(updated);
    } catch (error) {
      console.error('Failed to create backtesting:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div>Loading backtestings...</div>
      ) : (
        <div>
          {/* Render backtestings */}
          <button 
            disabled={creating}
            onClick={() => handleCreateBacktesting(data)}
          >
            {creating ? 'Creating...' : 'Create Backtesting'}
          </button>
        </div>
      )}
    </div>
  );
};
```

## Environment Configuration

### Tạo config file cho different environments:
```typescript
// config/api.ts
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:1998'
  },
  production: {
    baseUrl: 'https://your-production-api.com'
  }
};

export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return API_CONFIG[env as keyof typeof API_CONFIG];
};

// Sử dụng
import { FreqtradeApiClient } from './api-types';
import { getApiConfig } from './config/api';

export const apiClient = new FreqtradeApiClient(getApiConfig().baseUrl);
```

## Testing

### Mock API client cho testing:
```typescript
// __mocks__/api-types.ts
export const mockApiClient = {
  getBacktestings: jest.fn().mockResolvedValue([]),
  createBacktesting: jest.fn().mockResolvedValue('mock-id'),
  // ... other methods
};

// test file
import { mockApiClient } from '../__mocks__/api-types';

test('should load backtestings', async () => {
  mockApiClient.getBacktestings.mockResolvedValue([
    { id: '1', name: 'Test', status: 'completed' }
  ]);
  
  // Test your component
});
```

## Performance Tips

1. **Caching**: Cache API responses khi có thể
2. **Pagination**: Implement pagination cho large datasets
3. **Debouncing**: Debounce search/filter operations
4. **Polling**: Sử dụng reasonable intervals cho polling (5-10 seconds)
5. **Error Retry**: Implement retry logic cho failed requests

## Troubleshooting

### Common Issues:

1. **CORS Error**: API đã enable CORS, nếu vẫn lỗi thì check browser console
2. **404 Errors**: Check endpoint URLs và IDs
3. **422 Validation Errors**: Check request body format
4. **500 Server Errors**: Check server logs và database connection

### Debug Mode:
```typescript
// Enable debug logging
const apiClient = new FreqtradeApiClient('http://localhost:1998');

// Override request method để log
const originalRequest = apiClient['request'];
apiClient['request'] = async function<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  console.log('API Request:', endpoint, options);
  const result = await originalRequest.call(this, endpoint, options);
  console.log('API Response:', result);
  return result;
};
```

## Support

Nếu gặp vấn đề với API integration:

1. Check `API_DOCUMENTATION.md` cho chi tiết endpoints
2. Verify server đang chạy tại `http://localhost:1998`
3. Check Swagger UI tại `http://localhost:1998/docs`
4. Review server logs để debug issues 