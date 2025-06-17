# Freqtrade Strategy Analysis API Documentation

## Base Information
- **Base URL**: `http://localhost:1998`
- **Framework**: FastAPI
- **Database**: MongoDB
- **CORS**: Enabled for all origins
- **Content-Type**: `application/json`

## API Endpoints Overview

### 1. Root Endpoint
```
GET /
```
**Response:**
```json
{
  "message": "Hello World"
}
```

---

## Backtesting APIs (`/backtestings`)

### 1.1 Get All Backtestings
```
GET /backtestings
```
**Description:** Lấy danh sách tất cả backtesting sessions

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "status": "pending|processing|completed|failed",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "pair_group_id": "string",
    "timeframe": "5m|15m|1h|4h|1d",
    "strategy_group_id": "string"
  }
]
```

### 1.2 Create Backtesting
```
POST /backtestings
```
**Description:** Tạo một backtesting session mới

**Request Body:**
```json
{
  "name": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD", 
  "timeframe": "5m|15m|1h|4h|1d",
  "pair_group_id": "string",
  "strategy_group_id": "string"
}
```

**Response:**
```json
"backtesting_id_string"
```

### 1.3 Get Backtesting Performance
```
GET /backtestings/{id}/performances
```
**Description:** Lấy kết quả performance của một backtesting session

**Path Parameters:**
- `id` (string): Backtesting ID

**Response:**
```json
[
  {
    "id": "string",
    "strategy_id": "string",
    "strategy_name": "string",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "wins": 0,
    "losses": 0,
    "draws": 0,
    "total_trades": 0,
    "trade_per_day": 0.0,
    "profit": 0.0,
    "final_balance": 0.0,
    "max_drawdown": 0.0,
    "profit_percentage": 0.0
  }
]
```

---

## Pair Groups APIs (`/pair-groups`)

### 2.1 Get All Pair Groups
```
GET /pair-groups
```
**Description:** Lấy danh sách tất cả pair groups

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "pairs": ["BTC/USDT", "ETH/USDT"],
    "description": "string"
  }
]
```

### 2.2 Create Pair Group
```
POST /pair-groups
```
**Description:** Tạo một pair group mới

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "pairs": ["BTC/USDT", "ETH/USDT", "ADA/USDT"]
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "pairs": ["BTC/USDT", "ETH/USDT", "ADA/USDT"]
}
```

### 2.3 Delete Pair Group
```
DELETE /pair-groups/{pair_group_id}
```
**Description:** Xóa một pair group

**Path Parameters:**
- `pair_group_id` (string): Pair Group ID

**Response:**
```json
{
  "success": true
}
```

### 2.4 Get All Available Pairs
```
GET /pair-groups/pairs
```
**Description:** Lấy danh sách tất cả pairs có sẵn

**Response:**
```json
[
  {
    "id": "string",
    "name": "BTC/USDT",
    "description": "string"
  }
]
```

---

## Strategies APIs (`/strategies`)

### 3.1 Get All Strategies
```
GET /strategies
```
**Description:** Lấy danh sách tất cả strategies

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "filename": "string",
    "description": "string",
    "explanation": "string",
    "indicators": ["RSI", "MACD", "EMA"],
    "example": "string"
  }
]
```

### 3.2 Get Strategy Details
```
GET /strategies/{strategyId}
```
**Description:** Lấy chi tiết của một strategy

**Path Parameters:**
- `strategyId` (string): Strategy ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "filename": "string", 
  "description": "string",
  "explanation": "string",
  "indicators": ["RSI", "MACD", "EMA"],
  "example": "string",
  "content": "string"
}
```

### 3.3 Update Strategy
```
PUT /strategies/{strategyId}
```
**Description:** Cập nhật thông tin strategy

**Path Parameters:**
- `strategyId` (string): Strategy ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "explanation": "string",
  "indicators": ["RSI", "MACD", "EMA"],
  "example": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### 3.4 AI Query for Strategy
```
POST /strategies/{strategyId}/ai-query
```
**Description:** Gửi query AI để phân tích strategy

**Path Parameters:**
- `strategyId` (string): Strategy ID

**Request Body:**
```json
{
  "query": "string",
  "query_type": "analyze|explain|improve|review",
  "content": "string (optional)"
}
```

**Response:**
```json
{
  "response": "string",
  "analysis": "string"
}
```

---

## Strategy Groups APIs (`/strategy-groups`)

### 4.1 Get All Strategy Groups
```
GET /strategy-groups
```
**Description:** Lấy danh sách tất cả strategy groups

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "strategies": ["strategy_name_1", "strategy_name_2"],
    "description": "string"
  }
]
```

### 4.2 Get Strategy Group Details
```
GET /strategy-groups/{id}
```
**Description:** Lấy chi tiết của một strategy group

**Path Parameters:**
- `id` (string): Strategy Group ID

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "strategies": ["strategy_name_1", "strategy_name_2"],
  "description": "string"
}
```

### 4.3 Create Strategy Group
```
POST /strategy-groups
```
**Description:** Tạo một strategy group mới

**Request Body:**
```json
{
  "name": "string",
  "strategies": ["strategy_name_1", "strategy_name_2"],
  "description": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "strategies": ["strategy_name_1", "strategy_name_2"],
  "description": "string"
}
```

### 4.4 Update Strategy Group
```
PUT /strategy-groups/{id}
```
**Description:** Cập nhật strategy group

**Path Parameters:**
- `id` (string): Strategy Group ID

**Request Body:**
```json
{
  "name": "string",
  "strategies": ["strategy_name_1", "strategy_name_2"],
  "description": "string"
}
```

**Response:**
```json
{
  "success": true
}
```

### 4.5 Delete Strategy Group
```
DELETE /strategy-groups/{id}
```
**Description:** Xóa strategy group

**Path Parameters:**
- `id` (string): Strategy Group ID

**Response:**
```json
{
  "success": true
}
```

---

## Data Models

### BacktestingRequest
```typescript
interface BacktestingRequest {
  name: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
  timeframe: "5m" | "15m" | "1h" | "4h" | "1d";
  pair_group_id: string;
  strategy_group_id: string;
}
```

### PairGroupRequest
```typescript
interface PairGroupRequest {
  name: string;
  description: string;
  pairs: string[]; // e.g., ["BTC/USDT", "ETH/USDT"]
}
```

### StrategyPerformance
```typescript
interface StrategyPerformance {
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
```

### StrategyUpdateRequest
```typescript
interface StrategyUpdateRequest {
  name: string;
  description: string;
  explanation: string;
  indicators: string[];
  example: string;
}
```

### AIQueryRequest
```typescript
interface AIQueryRequest {
  query: string;
  query_type: "analyze" | "explain" | "improve" | "review";
  content?: string; // optional
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found  
- `422`: Validation Error
- `500`: Internal Server Error

---

## Frontend Integration Examples

### JavaScript/TypeScript Examples

#### 1. Fetch All Backtestings
```javascript
const fetchBacktestings = async () => {
  try {
    const response = await fetch('http://localhost:1998/backtestings');
    const backtestings = await response.json();
    return backtestings;
  } catch (error) {
    console.error('Error fetching backtestings:', error);
  }
};
```

#### 2. Create New Backtesting
```javascript
const createBacktesting = async (backtestingData) => {
  try {
    const response = await fetch('http://localhost:1998/backtestings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backtestingData)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating backtesting:', error);
  }
};

// Usage
const newBacktesting = {
  name: "BTC Strategy Test",
  start_date: "2024-01-01",
  end_date: "2024-01-31",
  timeframe: "1h",
  pair_group_id: "65f123...",
  strategy_group_id: "65f456..."
};
createBacktesting(newBacktesting);
```

#### 3. Get Strategy Performance
```javascript
const getBacktestingPerformance = async (backtestingId) => {
  try {
    const response = await fetch(
      `http://localhost:1998/backtestings/${backtestingId}/performances`
    );
    const performances = await response.json();
    return performances;
  } catch (error) {
    console.error('Error fetching performance:', error);
  }
};
```

#### 4. AI Query for Strategy
```javascript
const queryStrategyAI = async (strategyId, query, queryType) => {
  try {
    const response = await fetch(
      `http://localhost:1998/strategies/${strategyId}/ai-query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          query_type: queryType,
          content: null
        })
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error querying AI:', error);
  }
};
```

---

## Notes for Frontend Developers

1. **CORS**: API đã enable CORS cho tất cả origins, không cần xử lý CORS issues
2. **Date Format**: Tất cả dates đều sử dụng format `YYYY-MM-DD`
3. **IDs**: Tất cả IDs đều là MongoDB ObjectId strings
4. **Timeframes**: Chỉ support các timeframes: `5m`, `15m`, `1h`, `4h`, `1d`
5. **Status Values**: Backtesting status có thể là: `pending`, `processing`, `completed`, `failed`
6. **Error Handling**: Luôn check response status và handle errors appropriately
7. **Loading States**: Backtesting process có thể mất thời gian, cần implement loading states
8. **Real-time Updates**: Có thể cần polling để check backtesting status updates

---

## Development Server
```bash
# Start server
cd server
python -m uvicorn app:app --port 1998 --reload
```

Server sẽ chạy tại: `http://localhost:1998`
API Documentation (Swagger UI): `http://localhost:1998/docs` 