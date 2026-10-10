export interface DiagramSample {
  id: string;
  title: string;
  icon: string;
  code: string;
}

export const SAMPLES: DiagramSample[] = [
  {
    id: 'architecture',
    title: 'Cloud Architecture',
    icon: '☁️',
    code: `flowchart TB
    subgraph Clients ["🌐 Client Applications"]
        web["💻 Web Frontend (React)"]
        mobile["📱 iOS & Android Apps"]
        cli["⚡ Dev CLI Tools"]
    end

    subgraph Edge ["🛡️ Edge & Security"]
        cf["☁️ Cloudflare CDN / WAF"]
        apigw["🚀 API Gateway (Kong)"]
    end

    subgraph Services ["⚡ Microservices Grid"]
        auth["🔐 Identity & OAuth"]
        orders["📦 Order Processing"]
        pay["💳 Payment Gateway"]
        notify["🔔 Realtime Event Hub"]
    end

    subgraph Data ["💾 Persistent Stores"]
        pg[("🐘 Primary Postgres Cluster")]
        redis[("⚡ Redis In-Memory Cache")]
        kafka[("📨 Apache Kafka Mesh")]
        s3[("📦 S3 Asset Storage")]
    end

    Clients --> cf
    cf --> apigw
    apigw --> auth & orders & pay
    orders --> kafka
    pay --> kafka
    kafka --> notify
    orders --> pg
    auth --> redis
    orders --> redis
    notify --> mobile & web`,
  },
  {
    id: 'sequence',
    title: 'Auth & Checkout',
    icon: '💳',
    code: `sequenceDiagram
    autonumber
    actor Customer as 👤 Customer
    participant App as 📱 Mobile App
    participant Auth as 🛡️ Auth Service
    participant API as ⚡ Core API
    participant Stripe as 💳 Stripe Engine

    Customer->>App: Tap "Checkout with 1-Click"
    App->>Auth: Validate Session Bearer Token
    Auth-->>App: Session OK (Role: Verified)
    App->>API: POST /api/v2/orders (Item #941)
    API->>Stripe: Create PaymentIntent ($89.00 USD)
    Stripe-->>API: 200 OK (ClientSecret generated)
    API-->>App: Ready for Confirmation
    App->>Customer: Prompt TouchID / Biometrics
    Customer->>App: Biometric Authenticated ✨
    App->>Stripe: Confirm Payment With Token
    Stripe-->>App: Payment Succeeded! 🎉
    App->>API: Notify Payment Completed
    API-->>Customer: Push Notification: Order Dispatched 🚀`,
  },
  {
    id: 'gitgraph',
    title: 'Git Flow Release',
    icon: '🌿',
    code: `gitGraph
    commit id: "Init v1.0"
    commit id: "Core Engine"
    branch develop
    checkout develop
    commit id: "Vite + React Setup"
    branch feature/vibrant-ui
    checkout feature/vibrant-ui
    commit id: "Add Cyberpunk Themes"
    commit id: "Compact Floating Drawer"
    checkout develop
    merge feature/vibrant-ui tag: "PR #108"
    branch feature/pan-zoom
    checkout feature/pan-zoom
    commit id: "Smooth Canvas Dragging"
    commit id: "High-DPI PNG Exporter"
    checkout develop
    merge feature/pan-zoom tag: "PR #109"
    checkout main
    merge develop tag: "v2.0-PRO-RELEASE"`,
  },
  {
    id: 'mindmap',
    title: 'Product Mindmap',
    icon: '🧠',
    code: `mindmap
  root((🚀 Mermaid Pro))
    Interactive Canvas
      Smooth Drag to Pan
      Mousewheel Zoom
      Fit to Screen Auto-align
      Fullscreen Presentation
    Vibrant Aesthetics
      Cyberpunk Neon
      Aurora Emerald
      Sunset Horizon
      Cosmic Indigo
      Crisp Light
    Smart Viewer UX
      1-Click System Paste
      Compact Auto-drawer
      Sample Preset Gallery
    Export & Share
      Vector SVG Download
      2x Retina PNG Export
      Direct Clipboard Copy`,
  },
  {
    id: 'classDiagram',
    title: 'Domain Model',
    icon: '🧩',
    code: `classDiagram
    class User {
        +UUID id
        +String email
        +String fullName
        +Boolean isPremium
        +login()
        +upgradePlan()
    }
    class Project {
        +UUID id
        +String title
        +DateTime createdAt
        +exportSVG()
        +exportPNG()
    }
    class DiagramItem {
        +UUID id
        +String mermaidCode
        +String currentTheme
        +render()
        +validateSyntax()
    }
    class Workspace {
        +String name
        +List~Project~ projects
        +addProject()
    }

    User "1" --> "*" Workspace : owns
    Workspace "1" *-- "*" Project : contains
    Project "1" *-- "*" DiagramItem : holds`,
  },
  {
    id: 'state',
    title: 'Order State Machine',
    icon: '🔄',
    code: `stateDiagram-v2
    [*] --> Draft : Customer selects items
    Draft --> PendingPayment : Click "Proceed to Checkout"
    PendingPayment --> Processing : Payment Captured ✅
    PendingPayment --> PaymentFailed : Card Declined ❌
    PaymentFailed --> PendingPayment : Retry with new card
    PaymentFailed --> Cancelled : Timeout 24h
    Processing --> Shipped : Dispatched by Warehouse 📦
    Shipped --> InTransit : Courier scanned parcel
    InTransit --> Delivered : Signed by Customer 🏡
    Delivered --> [*]
    Cancelled --> [*]`,
  },
];
