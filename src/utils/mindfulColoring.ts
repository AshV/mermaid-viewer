/**
 * Mindful Color Coding Engine for Mermaid Diagrams
 * Provides cognitive color hierarchy, semantic node styling, and SVG enhancement.
 */

export interface ColorCategory {
  id: string;
  label: string;
  color: string;
  fill: string;
  border: string;
  text: string;
  description: string;
}

export type MindfulStrategy = 'semantic' | 'clusters' | 'progression' | 'accessible';

export const MINDFUL_PALETTES: Record<MindfulStrategy, { name: string; categories: ColorCategory[] }> = {
  semantic: {
    name: 'Semantic Architecture',
    categories: [
      {
        id: 'client',
        label: 'Client & Ingress',
        color: '#0ea5e9',
        fill: 'rgba(14, 165, 233, 0.16)',
        border: '#38bdf8',
        text: '#e0f2fe',
        description: 'Web, mobile, user interfaces & entry points',
      },
      {
        id: 'gateway',
        label: 'Gateway & Routing',
        color: '#f59e0b',
        fill: 'rgba(245, 158, 11, 0.16)',
        border: '#fbbf24',
        text: '#fef3c7',
        description: 'Proxies, edge CDN, auth & decision gateways',
      },
      {
        id: 'service',
        label: 'Core Services & Logic',
        color: '#8b5cf6',
        fill: 'rgba(139, 92, 246, 0.16)',
        border: '#a78bfa',
        text: '#f5f3ff',
        description: 'Microservices, business APIs & background workers',
      },
      {
        id: 'storage',
        label: 'Datastores & Storage',
        color: '#10b981',
        fill: 'rgba(16, 185, 129, 0.16)',
        border: '#34d399',
        text: '#ecfdf5',
        description: 'SQL/NoSQL databases, Redis caches & blob storage',
      },
      {
        id: 'event',
        label: 'Messaging & Queues',
        color: '#ec4899',
        fill: 'rgba(236, 72, 153, 0.16)',
        border: '#f472b6',
        text: '#fdf2f8',
        description: 'Kafka, RabbitMQ, pub/sub topics & event streams',
      },
      {
        id: 'success',
        label: 'Success & Approval',
        color: '#22c55e',
        fill: 'rgba(34, 197, 94, 0.16)',
        border: '#4ade80',
        text: '#f0fdf4',
        description: 'Completed states, 200 OK & happy paths',
      },
      {
        id: 'error',
        label: 'Error & Exceptions',
        color: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.16)',
        border: '#f87171',
        text: '#fef2f2',
        description: 'Failed states, alerts & rollbacks',
      },
    ],
  },
  clusters: {
    name: 'Cluster & Subgraph Grouping',
    categories: [
      { id: 'c1', label: 'Tier 1 (Front)', color: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', border: '#22d3ee', text: '#ecfeff', description: 'Frontline components' },
      { id: 'c2', label: 'Tier 2 (Security)', color: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', border: '#fbbf24', text: '#fffbeb', description: 'Security & inspection' },
      { id: 'c3', label: 'Tier 3 (Domain)', color: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.15)', border: '#a78bfa', text: '#f5f3ff', description: 'Domain execution' },
      { id: 'c4', label: 'Tier 4 (Persistence)', color: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', border: '#34d399', text: '#ecfdf5', description: 'Data tier' },
      { id: 'c5', label: 'Tier 5 (Async)', color: '#f43f5e', fill: 'rgba(244, 63, 94, 0.15)', border: '#fb7185', text: '#fff1f2', description: 'Async streaming' },
    ],
  },
  progression: {
    name: 'Flow Progression',
    categories: [
      { id: 'step-start', label: '1. Initiation', color: '#38bdf8', fill: 'rgba(56, 189, 248, 0.16)', border: '#38bdf8', text: '#f0f9ff', description: 'Starting triggers' },
      { id: 'step-proc', label: '2. Processing', color: '#818cf8', fill: 'rgba(129, 140, 248, 0.16)', border: '#818cf8', text: '#eef2ff', description: 'Intermediate handling' },
      { id: 'step-eval', label: '3. Evaluation', color: '#fbbf24', fill: 'rgba(251, 191, 36, 0.16)', border: '#fbbf24', text: '#fffbeb', description: 'Validation & decision' },
      { id: 'step-end', label: '4. Final State', color: '#34d399', fill: 'rgba(52, 211, 153, 0.16)', border: '#34d399', text: '#ecfdf5', description: 'Outcome & terminal' },
    ],
  },
  accessible: {
    name: 'High Contrast (Accessible)',
    categories: [
      { id: 'acc-blue', label: 'Input / Blue', color: '#0072B2', fill: 'rgba(0, 114, 178, 0.2)', border: '#56B4E9', text: '#ffffff', description: 'Primary flow' },
      { id: 'acc-orange', label: 'Gateway / Orange', color: '#D55E00', fill: 'rgba(213, 94, 0, 0.2)', border: '#E69F00', text: '#ffffff', description: 'Critical checkpoint' },
      { id: 'acc-green', label: 'Storage / Green', color: '#009E73', fill: 'rgba(0, 158, 115, 0.2)', border: '#009E73', text: '#ffffff', description: 'Persistent state' },
      { id: 'acc-purple', label: 'Service / Purple', color: '#CC79A7', fill: 'rgba(204, 121, 167, 0.2)', border: '#CC79A7', text: '#ffffff', description: 'Execution service' },
    ],
  },
};

/**
 * Detects semantic role based on node text, ID, or shapes
 */
export const detectNodeSemanticCategory = (text: string, shapeType?: string): string => {
  const lower = text.toLowerCase();

  // Explicit status / outcome
  if (lower.includes('success') || lower.includes('approved') || lower.includes('200') || lower.includes('done') || lower.includes('completed') || lower.includes('delivered') || lower.includes('✅')) {
    return 'success';
  }
  if (lower.includes('error') || lower.includes('failed') || lower.includes('declined') || lower.includes('timeout') || lower.includes('cancelled') || lower.includes('404') || lower.includes('500') || lower.includes('rejected') || lower.includes('❌')) {
    return 'error';
  }

  // Database / Storage
  if (shapeType === 'cylinder' || lower.includes('postgres') || lower.includes('redis') || lower.includes('mysql') || lower.includes('mongodb') || lower.includes('database') || lower.includes('storage') || lower.includes('s3') || lower.includes('datastore') || lower.includes('db') || lower.includes('🐘') || lower.includes('💾')) {
    return 'storage';
  }

  // Gateway / Routing / Decision
  if (shapeType === 'diamond' || lower.includes('gateway') || lower.includes('proxy') || lower.includes('kong') || lower.includes('cloudflare') || lower.includes('router') || lower.includes('auth') || lower.includes('waf') || lower.includes('verify') || lower.includes('check') || lower.includes('let me think') || lower.includes('decision') || lower.includes('?')) {
    return 'gateway';
  }

  // Messaging & Events
  if (lower.includes('kafka') || lower.includes('rabbit') || lower.includes('queue') || lower.includes('event') || lower.includes('topic') || lower.includes('pubsub') || lower.includes('webhook') || lower.includes('stream') || lower.includes('📨')) {
    return 'event';
  }

  // Client & Ingress
  if (lower.includes('client') || lower.includes('web') || lower.includes('mobile') || lower.includes('customer') || lower.includes('user') || lower.includes('app') || lower.includes('frontend') || lower.includes('browser') || lower.includes('ios') || lower.includes('android') || lower.includes('👤') || lower.includes('💻') || lower.includes('📱')) {
    return 'client';
  }

  // Default to core service
  return 'service';
};

/**
 * Applies mindful color hierarchy to the rendered SVG elements.
 * Non-destructive and works on ANY Mermaid diagram!
 */
export const applyMindfulColorsToSvg = (
  svgElement: SVGElement,
  strategy: MindfulStrategy = 'semantic',
  isDarkTheme: boolean = true
): void => {
  if (!svgElement) return;

  const palette = MINDFUL_PALETTES[strategy] || MINDFUL_PALETTES.semantic;
  const catMap = new Map(palette.categories.map((c) => [c.id, c]));

  // 1. Process Subgraphs / Clusters
  const clusters = Array.from(svgElement.querySelectorAll('.cluster, [id^="subGraph"], g.cluster'));
  clusters.forEach((cluster, idx) => {
    const cat = palette.categories[idx % palette.categories.length];
    if (!cat) return;

    cluster.setAttribute('data-mindful-category', cat.id);

    // Style cluster background rect or polygon
    const rects = cluster.querySelectorAll('rect, polygon, path');
    rects.forEach((r) => {
      // If it's the main cluster bounding box
      r.setAttribute('fill', isDarkTheme ? cat.fill : `${cat.color}15`);
      r.setAttribute('stroke', cat.border);
      r.setAttribute('stroke-width', '2');
      r.setAttribute('stroke-dasharray', 'none');
      r.setAttribute('rx', '12');
      r.setAttribute('ry', '12');
    });

    // Style cluster label
    const label = cluster.querySelector('.cluster-label, text');
    if (label) {
      label.setAttribute('fill', cat.color);
      (label as SVGElement).style.fontWeight = '700';
      (label as SVGElement).style.letterSpacing = '0.03em';
    }
  });

  // 2. Process Nodes
  const nodes = Array.from(svgElement.querySelectorAll('.node, .actor, g.node'));
  nodes.forEach((node, nodeIdx) => {
    const textElem = node.querySelector('text, .nodeLabel, span');
    const nodeText = textElem?.textContent || '';

    // Check if node has cylinder path or diamond
    const hasPath = !!node.querySelector('path');
    const hasPolygon = !!node.querySelector('polygon');
    const shapeType = hasPath ? 'cylinder' : hasPolygon ? 'diamond' : 'rect';

    let categoryId = 'service';
    if (strategy === 'semantic') {
      categoryId = detectNodeSemanticCategory(nodeText, shapeType);
    } else if (strategy === 'progression') {
      const stepIdx = Math.floor((nodeIdx / Math.max(nodes.length, 1)) * palette.categories.length);
      categoryId = palette.categories[Math.min(stepIdx, palette.categories.length - 1)].id;
    } else {
      // Check if inside a categorized cluster
      const parentCluster = node.closest('.cluster');
      if (parentCluster && parentCluster.getAttribute('data-mindful-category')) {
        categoryId = parentCluster.getAttribute('data-mindful-category')!;
      } else {
        categoryId = palette.categories[nodeIdx % palette.categories.length].id;
      }
    }

    const cat = catMap.get(categoryId) || palette.categories[0];
    node.setAttribute('data-mindful-category', cat.id);

    // Style the node shapes
    const shapes = node.querySelectorAll('rect, circle, ellipse, polygon, path');
    shapes.forEach((s) => {
      // Skip icons or inner paths that aren't the node background
      if (s.tagName.toLowerCase() === 'path' && s.parentElement?.tagName.toLowerCase() === 'svg') return;
      s.setAttribute('fill', isDarkTheme ? cat.fill : `${cat.color}18`);
      s.setAttribute('stroke', cat.border);
      s.setAttribute('stroke-width', '2px');
    });

    // Style node text for crisp legibility
    const texts = node.querySelectorAll('text, span');
    texts.forEach((t) => {
      t.setAttribute('fill', isDarkTheme ? '#f8fafc' : '#0f172a');
      (t as SVGElement).style.fontWeight = '600';
    });
  });

  // 3. Process Sequence Actors
  const actors = Array.from(svgElement.querySelectorAll('g.actor, .actor'));
  actors.forEach((actor, idx) => {
    const cat = palette.categories[idx % palette.categories.length];
    if (!cat) return;

    actor.setAttribute('data-mindful-category', cat.id);
    const rect = actor.querySelector('rect');
    if (rect) {
      rect.setAttribute('fill', isDarkTheme ? cat.fill : `${cat.color}20`);
      rect.setAttribute('stroke', cat.border);
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '8');
      rect.setAttribute('ry', '8');
    }
    const text = actor.querySelector('text');
    if (text) {
      text.setAttribute('fill', isDarkTheme ? '#ffffff' : '#0f172a');
      (text as SVGElement).style.fontWeight = '700';
    }
  });

  // 4. Enhance link arrows and edge paths
  const edgePaths = Array.from(svgElement.querySelectorAll('.edgePath path, path.edge-thickness-normal'));
  edgePaths.forEach((path) => {
    path.setAttribute('stroke', isDarkTheme ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)');
    path.setAttribute('stroke-width', '2');
  });

  // 5. Sequence diagram message lines
  const messageTexts = Array.from(svgElement.querySelectorAll('.messageText'));
  messageTexts.forEach((msg) => {
    const text = msg.textContent || '';
    if (text.includes('OK') || text.includes('Success') || text.includes('200') || text.includes('✅')) {
      msg.setAttribute('fill', '#4ade80');
      (msg as SVGElement).style.fontWeight = '600';
    } else if (text.includes('Error') || text.includes('Fail') || text.includes('Declined') || text.includes('❌')) {
      msg.setAttribute('fill', '#f87171');
      (msg as SVGElement).style.fontWeight = '600';
    }
  });
};

/**
 * Generate portable classDef definitions that can be inserted into Mermaid code
 */
export const generateMindfulClassDefs = (isDark: boolean = true): string => {
  if (isDark) {
    return `
    %% Mindful Architecture Color Hierarchy
    classDef client fill:#0ea5e925,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff
    classDef gateway fill:#f59e0b25,stroke:#fbbf24,stroke-width:2px,color:#fffbeb
    classDef service fill:#8b5cf625,stroke:#a78bfa,stroke-width:2px,color:#f5f3ff
    classDef storage fill:#10b98125,stroke:#34d399,stroke-width:2px,color:#ecfdf5
    classDef event fill:#ec489925,stroke:#f472b6,stroke-width:2px,color:#fdf2f8
    classDef success fill:#22c55e25,stroke:#4ade80,stroke-width:2px,color:#f0fdf4
    classDef error fill:#ef444425,stroke:#f87171,stroke-width:2px,color:#fef2f2
`;
  }

  return `
    %% Mindful Architecture Color Hierarchy (Light)
    classDef client fill:#0ea5e915,stroke:#0284c7,stroke-width:2px,color:#0c4a6e
    classDef gateway fill:#f59e0b15,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef service fill:#8b5cf615,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    classDef storage fill:#10b98115,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef event fill:#ec489915,stroke:#db2777,stroke-width:2px,color:#831843
    classDef success fill:#22c55e15,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef error fill:#ef444415,stroke:#dc2626,stroke-width:2px,color:#7f1d1d
`;
};

/**
 * Helper to highlight nodes matching a specific category in the diagram
 */
export const highlightCategory = (svgElement: SVGElement | null, categoryId: string | null): void => {
  if (!svgElement) return;

  const elements = svgElement.querySelectorAll('[data-mindful-category]');
  if (!categoryId) {
    // Reset opacity
    elements.forEach((el) => {
      (el as SVGElement).style.opacity = '1';
      (el as SVGElement).style.filter = 'none';
    });
    return;
  }

  elements.forEach((el) => {
    const cat = el.getAttribute('data-mindful-category');
    if (cat === categoryId) {
      (el as SVGElement).style.opacity = '1';
      (el as SVGElement).style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))';
    } else {
      (el as SVGElement).style.opacity = '0.25';
      (el as SVGElement).style.filter = 'grayscale(60%)';
    }
  });
};
