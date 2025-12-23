# BlogSpy System Architecture Diagram

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React 19 Components]
        C[Tailwind CSS + shadcn/ui]
        D[TipTap Rich Editor]
        E[Zustand State Management]
    end

    subgraph "API Gateway"
        F[Next.js API Routes]
        G[Rate Limiting]
        H[Authentication Middleware]
        I[Request Validation]
    end

    subgraph "Core Services"
        J[AI Writer Service]
        K[Keyword Research Service]
        L[Rank Tracking Service]
        M[Content Analysis Service]
        N[Competitor Analysis Service]
    end

    subgraph "External Integrations"
        O[DataForSEO API]
        P[Google GSC API]
        Q[Google GA4 API]
        R[Stripe Payment API]
        S[Clerk Auth API]
    end

    subgraph "Data Layer"
        T[(PostgreSQL Database)]
        U[(Supabase Backend)]
        V[(Redis Cache)]
        W[(File Storage)]
    end

    subgraph "Background Jobs"
        X[Cron Jobs]
        Y[Data Synchronization]
        Z[Content Decay Detection]
        AA[Alert Processing]
    end

    A --> F
    F --> J
    F --> K
    F --> L
    F --> M
    F --> N

    J --> O
    K --> O
    L --> P
    M --> Q
    N --> R

    J --> T
    K --> T
    L --> T
    M --> T
    N --> T

    X --> Y
    Y --> Z
    Z --> AA

    style A fill:#e1f5fe
    style J fill:#f3e5f5
    style K fill:#f3e5f5
    style L fill:#f3e5f5
    style M fill:#f3e5f5
    style N fill:#f3e5f5
    style O fill:#e8f5e8
    style P fill:#e8f5e8
    style Q fill:#e8f5e8
    style R fill:#e8f5e8
    style T fill:#fff3e0
    style U fill:#fff3e0
    style V fill:#fff3e0
```

## 🤖 AI Writer System Architecture

```mermaid
graph LR
    subgraph "AI Writer Frontend"
        A[TipTap Editor]
        B[SEO Copilot Sidebar]
        C[AI Tools Panel]
        D[Context Banner]
        E[Export Manager]
    end

    subgraph "Content Processing"
        F[Real-time Analysis]
        G[NLP Processing]
        H[SEO Scoring]
        I[Readability Check]
        J[Keyword Density]
    end

    subgraph "AI Tools (18+ Tools)"
        K[Plagiarism Checker]
        L[AI Detector]
        M[Content Humanizer]
        N[E-E-A-T Analyzer]
        O[Schema Generator]
        P[Snippet Optimizer]
        Q[Entity Coverage]
        R[Citation Manager]
        S[Internal Link Finder]
        T[People Also Ask]
        U[Content Brief]
        V[Competitor Analysis]
        W[Image SEO]
        X[Auto Optimizer]
        Y[Slash Commands]
    end

    subgraph "Service Layer"
        Z[AI Writer Service]
        AA[Draft Service]
        BB[Version History]
        CC[Export Service]
        DD[Credits Service]
    end

    A --> F
    B --> G
    C --> H
    D --> I
    E --> J

    F --> K
    F --> L
    F --> M
    F --> N
    F --> O
    F --> P
    F --> Q
    F --> R
    F --> S
    F --> T
    F --> U
    F --> V
    F --> W
    F --> X
    F --> Y

    K --> Z
    L --> Z
    M --> Z
    N --> Z
    O --> Z
    P --> Z
    Q --> Z
    R --> Z
    S --> Z
    T --> Z
    U --> Z
    V --> Z
    W --> Z
    X --> Z
    Y --> Z

    Z --> AA
    Z --> BB
    Z --> CC
    Z --> DD

    style A fill:#e3f2fd
    style Z fill:#f3e5f5
    style K fill:#e8f5e8
    style L fill:#e8f5e8
    style M fill:#e8f5e8
    style N fill:#e8f5e8
    style O fill:#e8f5e8
```

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    USERS {
        string id PK
        string clerk_id UK
        string email UK
        string name
        string avatar
        enum plan
        int credits
        string stripe_customer_id UK
        json settings
        datetime created_at
        datetime updated_at
        datetime last_login_at
    }

    SUBSCRIPTIONS {
        string id PK
        string user_id FK
        string stripe_subscription_id UK
        string stripe_price_id
        datetime stripe_current_period_end
        enum status
        enum plan
        datetime created_at
        datetime updated_at
        datetime canceled_at
    }

    PROJECTS {
        string id PK
        string user_id FK
        string name
        string domain
        string description
        json settings
        datetime created_at
        datetime updated_at
    }

    KEYWORDS {
        string id PK
        string user_id FK
        string project_id FK
        string keyword
        string location
        string language
        int volume
        int difficulty
        decimal cpc
        decimal competition
        string intent
        string trend
        json monthly_data
        json serp_features
        datetime created_at
        datetime updated_at
        datetime last_fetched_at
    }

    RANKINGS {
        string id PK
        string user_id FK
        string project_id FK
        string keyword_id FK
        int position
        int previous_position
        int change
        string url
        int traffic
        datetime created_at
        datetime checked_at
    }

    CONTENT {
        string id PK
        string user_id FK
        string project_id FK
        string title
        string url
        enum status
        int score
        int word_count
        int traffic
        int previous_traffic
        enum decay_risk
        json analysis
        json keywords
        datetime created_at
        datetime updated_at
        datetime published_at
        datetime last_analyzed_at
    }

    TOPIC_CLUSTERS {
        string id PK
        string user_id FK
        string project_id FK
        string name
        string pillar_topic
        int total_keywords
        decimal avg_difficulty
        int total_volume
        json topics
        datetime created_at
        datetime updated_at
    }

    API_USAGE {
        string id PK
        string user_id FK
        string endpoint
        string method
        int credits_used
        int status_code
        int response_time
        datetime created_at
    }

    USERS ||--o{ SUBSCRIPTIONS : has
    USERS ||--o{ PROJECTS : owns
    USERS ||--o{ KEYWORDS : searches
    USERS ||--o{ RANKINGS : tracks
    USERS ||--o{ CONTENT : creates
    USERS ||--o{ TOPIC_CLUSTERS : organizes
    USERS ||--o{ API_USAGE : consumes

    PROJECTS ||--o{ KEYWORDS : contains
    PROJECTS ||--o{ RANKINGS : monitors
    PROJECTS ||--o{ CONTENT : tracks
    PROJECTS ||--o{ TOPIC_CLUSTERS : contains

    KEYWORDS ||--o{ RANKINGS : has
```

## 🌐 API Architecture Flow

```mermaid
sequenceDiagram
    participant Client
    participant NextJS
    participant Auth
    participant API_Route
    participant Service
    participant Database
    participant External_API

    Client->>NextJS: HTTP Request
    NextJS->>Auth: Validate Token
    Auth->>NextJS: User Context
    
    alt Authenticated
        NextJS->>API_Route: Process Request
        API_Route->>Service: Business Logic
        Service->>Database: Query Data
        
        alt Cache Hit
            Service->>Database: Get from Cache
        else Cache Miss
            Service->>External_API: Fetch Data
            Service->>Database: Store in Cache
        end
        
        Database->>Service: Return Data
        Service->>API_Route: Processed Data
        API_Route->>NextJS: JSON Response
        NextJS->>Client: Success Response
        
    else Unauthenticated
        NextJS->>Client: 401 Unauthorized
    end

    Note over Client,External_API: Background Jobs
    Cron->>Service: Scheduled Task
    Service->>External_API: Sync Data
    Service->>Database: Update Records
    Service->>Client: Send Alert
```

## 🔄 Data Flow Architecture

```mermaid
graph TD
    subgraph "Data Ingestion"
        A[User Input Forms]
        B[External API Calls]
        C[Web Scraping]
        D[File Uploads]
    end

    subgraph "Data Processing"
        E[Data Validation]
        F[Data Transformation]
        G[Data Enrichment]
        H[Data Deduplication]
    end

    subgraph "Data Storage"
        I[(PostgreSQL)]
        J[(Redis Cache)]
        K[(File Storage)]
    end

    subgraph "Data Analysis"
        L[Keyword Analysis]
        M[Ranking Calculation]
        N[Content Scoring]
        O[Trend Detection]
    end

    subgraph "Data Output"
        P[Dashboard Widgets]
        Q[API Responses]
        R[Export Files]
        S[Email Reports]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> F
    F --> G
    G --> H

    H --> I
    H --> J
    H --> K

    I --> L
    I --> M
    I --> N
    I --> O

    L --> P
    M --> Q
    N --> R
    O --> S

    style A fill:#e1f5fe
    style E fill:#fff3e0
    style I fill:#f3e5f5
    style L fill:#e8f5e8
    style P fill:#fce4ec
```

## 🛡️ Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS Only]
        B[Content Security Policy]
        C[XSS Protection]
        D[CSRF Tokens]
    end

    subgraph "API Security"
        E[Authentication Middleware]
        F[Rate Limiting]
        G[Input Validation]
        H[SQL Injection Prevention]
    end

    subgraph "Data Security"
        I[Encryption at Rest]
        J[Encryption in Transit]
        K[Data Sanitization]
        L[Access Control]
    end

    subgraph "Infrastructure Security"
        M[Firewall Rules]
        N[DDoS Protection]
        O[Monitoring & Alerts]
        P[Backup Encryption]
    end

    A --> E
    B --> F
    C --> G
    D --> H

    E --> I
    F --> J
    G --> K
    H --> L

    I --> M
    J --> N
    K --> O
    L --> P

    style A fill:#ffebee
    style E fill:#fff3e0
    style I fill:#e8f5e8
    style M fill:#f3e5f5
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development]
        B[Feature Branches]
        C[Pull Requests]
        D[Code Review]
    end

    subgraph "CI/CD Pipeline"
        E[GitHub Actions]
        F[Automated Testing]
        G[Build & Bundle]
        H[Deploy to Staging]
    end

    subgraph "Staging Environment"
        I[Integration Testing]
        J[Performance Testing]
        K[Security Scanning]
    end

    subgraph "Production"
        L[Vercel Deployment]
        M[Database Migration]
        N[CDN Distribution]
        O[Monitoring]
    end

    subgraph "External Services"
        P[Supabase Database]
        Q[Redis Cache]
        R[File Storage]
        S[External APIs]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> F
    F --> G
    G --> H

    H --> I
    I --> J
    J --> K

    K --> L
    L --> M
    L --> N
    L --> O

    M --> P
    N --> Q
    O --> R
    O --> S

    style A fill:#e3f2fd
    style E fill:#fff3e0
    style L fill:#e8f5e8
    style P fill:#f3e5f5
```

## 📊 Feature Module Dependencies

```mermaid
graph LR
    subgraph "Core Features"
        A[Dashboard]
        B[AI Writer]
        C[Keyword Research]
        D[Rank Tracking]
        E[Content Analysis]
    end

    subgraph "Advanced Features"
        F[Competitor Analysis]
        G[Topic Clusters]
        H[Content Decay]
        I[Trend Spotter]
        J[Snippet Stealer]
    end

    subgraph "Utility Features"
        K[On-Page Checker]
        L[Citation Checker]
        M[Video Hijack]
        N[Social Tracker]
        O[Alert System]
    end

    C --> B
    C --> D
    C --> F
    C --> G
    C --> I

    B --> E
    B --> K
    B --> L

    D --> H
    D --> O

    E --> F
    E --> J
    E --> M

    G --> B
    G --> E

    I --> D
    I --> O

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## 🔧 Technology Stack Visualization

```mermaid
graph TB
    subgraph "Frontend Technologies"
        A[Next.js 16]
        B[React 19]
        C[TypeScript]
        D[Tailwind CSS]
        E[shadcn/ui]
        F[TipTap Editor]
    end

    subgraph "Backend Technologies"
        G[Node.js]
        H[Prisma ORM]
        I[PostgreSQL]
        J[Supabase]
        K[Redis]
        L[Next.js API Routes]
    end

    subgraph "External Services"
        M[DataForSEO]
        N[Google APIs]
        O[Stripe]
        P[Clerk]
        Q[Resend]
        R[Vercel]
    end

    subgraph "Development Tools"
        S[ESLint]
        T[Prettier]
        U[GitHub Actions]
        V[Jest]
        W[TypeScript Compiler]
    end

    A --> G
    B --> A
    C --> W
    D --> E
    E --> A
    F --> B

    G --> L
    H --> I
    I --> J
    J --> K

    L --> M
    L --> N
    L --> O
    L --> P
    L --> Q

    G --> R

    C --> S
    C --> T
    A --> U
    G --> V

    style A fill:#000000
    style B fill:#61dafb
    style C fill:#3178c6
    style D fill:#06b6d4
    style I fill:#336791
    style G fill:#339933
```

---

**Diagram Version**: 1.0  
**Last Updated**: December 21, 2024  
**Purpose**: Visual representation of BlogSpy system architecture  
**Format**: Mermaid diagrams for documentation and presentation