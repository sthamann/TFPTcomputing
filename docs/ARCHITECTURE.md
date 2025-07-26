# Architecture Documentation

## System Overview

The Topological Constants Calculator is a three-tier application designed for calculating and exploring physics constants based on the Topological Fixed Point Framework.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Frontend<br/>Port 3000]
    end
    
    subgraph "API Layer"
        API[Express API Gateway<br/>Port 8000]
        WS[WebSocket Server]
    end
    
    subgraph "Compute Layer"
        PY[FastAPI Python Service<br/>Port 8001]
        JUP[Jupyter Kernel]
    end
    
    subgraph "Data Layer"
        JSON[Constants JSON]
        NB[Jupyter Notebooks]
        CACHE[Results Cache]
    end
    
    UI -->|HTTP/WS| API
    API -->|HTTP| PY
    API -->|Read| JSON
    PY -->|Execute| JUP
    PY -->|Read/Write| NB
    PY -->|Cache| CACHE
    WS -.->|Live Updates| UI
```

## Component Details

### Frontend (React + Vite)

**Purpose**: Provides the user interface for exploring constants, running calculations, and visualizing relationships.

**Key Technologies**:
- React 18 with hooks
- Vite for fast development
- TailwindCSS for styling
- KaTeX for math rendering
- Monaco Editor for code editing
- vis-network for graph visualization

**Main Components**:
```mermaid
graph LR
    App[App.jsx]
    App --> Layout[Layout]
    App --> Router[React Router]
    
    Router --> CP[ConstantsPage]
    Router --> CDP[ConstantDetailPage]
    Router --> PP[PlaygroundPage]
    Router --> DP[DAGPage]
    
    CDP --> KF[KaTeXFormula]
    PP --> ME[Monaco Editor]
    DP --> VN[vis-network]
```

### Backend (Node.js + Express)

**Purpose**: Acts as an API gateway, handling authentication, rate limiting, and routing requests to appropriate services.

**Key Features**:
- RESTful API endpoints
- WebSocket support for live updates
- Swagger/OpenAPI documentation
- Request validation and error handling
- CORS configuration

**API Routes**:
```
GET    /api/constants              # List all constants
GET    /api/constants/:id          # Get constant details
POST   /api/constants/:id/calculate # Calculate constant
POST   /api/playground/run         # Run custom formula
GET    /api/dag                    # Get dependency graph
WS     /ws                         # WebSocket connection
```

### Compute Service (Python + FastAPI)

**Purpose**: Handles all mathematical computations, notebook execution, and caching.

**Key Components**:
```mermaid
graph TD
    API[FastAPI App]
    API --> CE[Calculation Engine]
    API --> DAG[DAG Builder]
    API --> PG[Playground Executor]
    
    CE --> PM[Papermill]
    PM --> JK[Jupyter Kernel]
    CE --> CACHE[Results Cache]
    
    DAG --> NX[NetworkX]
```

**Execution Flow**:
1. Receives calculation request
2. Checks cache for existing results
3. Loads constant definition and dependencies
4. Executes Jupyter notebook with Papermill
5. Extracts results and stores in cache
6. Returns results via API

### Data Layer

**Constants Catalog Structure**:
```
constants/
├── data/                 # JSON definitions
│   ├── alpha.json       # Fine structure constant
│   ├── phi.json         # Golden ratio
│   └── phi_0.json       # Golden angle
├── notebooks/           # Generated notebooks
│   ├── alpha.ipynb
│   ├── phi.ipynb
│   └── phi_0.ipynb
├── results/             # Calculation results
└── scripts/             # Generation scripts
```

**Constant Definition Schema**:
```json
{
  "id": "string",
  "symbol": "string",
  "name": "string",
  "description": "string",
  "unit": "string",
  "formula": "string",
  "dependencies": ["string"],
  "category": "fundamental|derived|composite",
  "sources": [{
    "name": "string",
    "year": "number",
    "value": "number",
    "uncertainty": "number",
    "url": "string"
  }],
  "accuracyTarget": "number"
}
```

## Data Flow

### Calculation Request Flow

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as API Gateway
    participant PY as Python Service
    participant NB as Notebook
    participant CACHE as Cache
    
    UI->>API: POST /api/constants/alpha/calculate
    API->>PY: Forward request
    PY->>CACHE: Check cache
    
    alt Cache miss
        PY->>NB: Execute notebook
        NB->>PY: Return results
        PY->>CACHE: Store results
    end
    
    PY->>API: Return results
    API->>UI: JSON response
    
    Note over UI: WebSocket for live updates
    PY-->>API: Progress updates
    API-->>UI: Stream updates
```

### Dependency Resolution

```mermaid
graph BT
    alpha[α - Fine Structure]
    phi_0[φ₀ - Golden Angle]
    phi[φ - Golden Ratio]
    
    alpha --> phi_0
    phi_0 --> phi
    
    style alpha fill:#e1f5fe
    style phi_0 fill:#fff3e0
    style phi fill:#f3e5f5
```

## Deployment Architecture

### Docker Compose Setup

```yaml
services:
  python:    # Compute service
  api:       # API gateway
  web:       # Frontend
```

### Production Deployment

```mermaid
graph TD
    LB[Load Balancer]
    
    subgraph "Web Tier"
        WEB1[Nginx + React]
        WEB2[Nginx + React]
    end
    
    subgraph "API Tier"
        API1[Express API]
        API2[Express API]
    end
    
    subgraph "Compute Tier"
        PY1[Python Service]
        PY2[Python Service]
    end
    
    subgraph "Data Tier"
        REDIS[Redis Cache]
        S3[S3 Storage]
    end
    
    LB --> WEB1
    LB --> WEB2
    WEB1 --> API1
    WEB2 --> API2
    API1 --> PY1
    API2 --> PY2
    PY1 --> REDIS
    PY2 --> REDIS
    PY1 --> S3
    PY2 --> S3
```

## Security Considerations

1. **Input Validation**: All formula inputs are parsed with SymPy, preventing code injection
2. **Rate Limiting**: Express rate limiter prevents API abuse
3. **CORS**: Configured for specific origins in production
4. **Notebook Isolation**: Papermill executes notebooks in isolated kernels
5. **No Eval**: Frontend never uses eval() for formula rendering

## Performance Optimizations

1. **Caching Strategy**:
   - In-memory cache for recent calculations
   - Redis for distributed caching in production
   - Cache invalidation on constant updates

2. **Lazy Loading**:
   - Notebooks generated on-demand
   - Frontend code splitting with React.lazy()

3. **Parallel Execution**:
   - Multiple notebook kernels for concurrent calculations
   - WebSocket connection pooling

## Monitoring and Observability

```mermaid
graph LR
    APP[Application] --> LOG[Winston Logs]
    APP --> MET[Prometheus Metrics]
    APP --> TRACE[OpenTelemetry]
    
    LOG --> ELK[ELK Stack]
    MET --> GRAF[Grafana]
    TRACE --> JAE[Jaeger]
```

## Development Workflow

```mermaid
graph LR
    DEV[Developer] --> GIT[Git Push]
    GIT --> CI[GitHub Actions]
    CI --> TEST[Run Tests]
    CI --> BUILD[Build Images]
    TEST --> DEPLOY[Deploy]
    BUILD --> DEPLOY
    DEPLOY --> STAGE[Staging]
    STAGE --> PROD[Production]
```

## Future Enhancements

1. **GraphQL API**: Alternative to REST for flexible queries
2. **Real-time Collaboration**: Multiple users editing formulas
3. **GPU Acceleration**: For complex calculations
4. **Mobile App**: React Native client
5. **AI Assistant**: Help with formula creation 