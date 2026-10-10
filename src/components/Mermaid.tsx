import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, ZoomIn, ZoomOut, Maximize, RotateCcw, Move, Sparkles, Layers, Eye } from 'lucide-react';
import type { DiagramTheme } from '../themes';
import { 
  applyMindfulColorsToSvg, 
  highlightCategory, 
  MINDFUL_PALETTES, 
  type MindfulStrategy 
} from '../utils/mindfulColoring';

export interface MermaidViewerRef {
  getSvgElement: () => SVGElement | null;
  fitToScreen: () => void;
  resetView: () => void;
}

interface MermaidProps {
  code: string;
  theme: DiagramTheme;
  mindfulEnabled?: boolean;
  mindfulStrategy?: MindfulStrategy;
  onError?: (error: string | null) => void;
  onScaleChange?: (scale: number) => void;
}

export const MermaidViewer = forwardRef<MermaidViewerRef, MermaidProps>(
  ({ 
    code, 
    theme, 
    mindfulEnabled = true, 
    mindfulStrategy = 'semantic', 
    onError, 
    onScaleChange 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [svgCode, setSvgCode] = useState<string>('');
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
    const [showLegend, setShowLegend] = useState<boolean>(true);

    const dragStartRef = useRef({ x: 0, y: 0 });
    const initialPanRef = useRef({ x: 0, y: 0 });

    // Expose ref functions for parent
    useImperativeHandle(ref, () => ({
      getSvgElement: () => containerRef.current?.querySelector('svg') || null,
      fitToScreen: () => handleFitToScreen(),
      resetView: () => {
        setScale(1);
        setPan({ x: 0, y: 0 });
        onScaleChange?.(1);
      },
    }));

    // Update parent about scale changes
    useEffect(() => {
      onScaleChange?.(scale);
    }, [scale, onScaleChange]);

    // Apply mindful color coding to the rendered SVG
    const applyMindfulStyling = useCallback(() => {
      const svgEl = containerRef.current?.querySelector('svg');
      if (!svgEl) return;

      if (mindfulEnabled) {
        applyMindfulColorsToSvg(svgEl, mindfulStrategy, theme.isDark);
      }
    }, [mindfulEnabled, mindfulStrategy, theme.isDark]);

    // Render diagram
    useEffect(() => {
      let isMounted = true;

      const renderChart = async () => {
        if (!code.trim()) {
          setSvgCode('');
          setErrorMsg(null);
          onError?.(null);
          return;
        }

        setIsLoading(true);
        const renderId = 'mermaid-chart-' + Math.random().toString(36).substring(2, 9);

        try {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
            theme: theme.mermaidTheme,
            themeVariables: theme.themeVariables,
          });

          const { svg } = await mermaid.render(renderId, code);
          if (isMounted) {
            setSvgCode(svg);
            setErrorMsg(null);
            onError?.(null);
          }
        } catch (error: any) {
          if (isMounted) {
            const badEl = document.getElementById(renderId);
            if (badEl) badEl.remove();
            const dBadEl = document.getElementById('d' + renderId);
            if (dBadEl) dBadEl.remove();

            const msg = error?.message || error?.str || 'Syntax error in Mermaid diagram';
            setErrorMsg(msg);
            onError?.(msg);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      const timer = setTimeout(renderChart, 250);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }, [code, theme, onError]);

    // Post-process SVG whenever svgCode, mindfulEnabled, or mindfulStrategy changes
    useEffect(() => {
      if (svgCode) {
        applyMindfulStyling();
      }
    }, [svgCode, applyMindfulStyling]);

    // Interactive Legend Hover Highlight
    useEffect(() => {
      const svgEl = containerRef.current?.querySelector('svg');
      highlightCategory(svgEl || null, hoveredCategory);
    }, [hoveredCategory]);

    // Fit diagram nicely into canvas
    const handleFitToScreen = () => {
      const svg = containerRef.current?.querySelector('svg');
      const wrapper = wrapperRef.current;
      if (!svg || !wrapper) return;

      const svgBBox = svg.getBoundingClientRect();
      const wrapperBBox = wrapper.getBoundingClientRect();

      if (svgBBox.width === 0 || svgBBox.height === 0) return;

      const naturalWidth = svgBBox.width / scale;
      const naturalHeight = svgBBox.height / scale;

      const padding = 130;
      const targetW = Math.max(wrapperBBox.width - padding, 200);
      const targetH = Math.max(wrapperBBox.height - padding, 200);

      const ratio = Math.min(targetW / naturalWidth, targetH / naturalHeight);
      const newScale = Math.min(Math.max(ratio, 0.2), 3);

      setScale(newScale);
      setPan({ x: 0, y: 0 });
    };

    // Zoom handlers
    const zoomIn = () => setScale((s) => Math.min(Number((s * 1.2).toFixed(2)), 5));
    const zoomOut = () => setScale((s) => Math.max(Number((s / 1.2).toFixed(2)), 0.15));
    const resetZoom = () => {
      setScale(1);
      setPan({ x: 0, y: 0 });
    };

    // Mouse drag handlers for panning
    const handleMouseDown = (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      initialPanRef.current = { ...pan };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: initialPanRef.current.x + dx,
        y: initialPanRef.current.y + dy,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Mouse wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setScale((s) => Math.min(Math.max(Number((s * zoomFactor).toFixed(2)), 0.15), 5));
    };

    const activePalette = MINDFUL_PALETTES[mindfulStrategy] || MINDFUL_PALETTES.semantic;

    return (
      <div
        ref={wrapperRef}
        className="viewer-viewport"
        style={{
          backgroundColor: theme.canvasBg,
          backgroundImage: `radial-gradient(${theme.gridColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={resetZoom}
      >
        {/* Glow ambient accent light */}
        <div
          className="canvas-ambient-glow"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${theme.accentColor}25 0%, transparent 60%)`,
          }}
        />

        {/* Empty state hint when no code */}
        {!code.trim() && !errorMsg && (
          <div className="viewer-empty-state">
            <Sparkles size={36} style={{ color: theme.accentColor }} />
            <h3>No Mermaid Diagram Loaded</h3>
            <p>Click "Paste from Clipboard" or pick a preset sample below to begin viewing.</p>
          </div>
        )}

        {/* Diagram SVG container */}
        <div
          ref={containerRef}
          className="mermaid-render-box"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />

        {/* Interactive Mindful Color Legend (Guides the user through colors) */}
        {mindfulEnabled && code.trim() && (
          <div 
            className={`mindful-legend-panel ${showLegend ? 'open' : 'minimized'}`}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="legend-header" onClick={() => setShowLegend(!showLegend)}>
              <div className="legend-title">
                <Layers size={14} className="legend-icon" />
                <span>Mindful Guide: {activePalette.name}</span>
              </div>
              <span className="legend-toggle-pill">
                {showLegend ? 'Hide' : 'Show Legend'}
              </span>
            </div>

            {showLegend && (
              <div className="legend-items-list">
                <div className="legend-hint">
                  <Eye size={12} />
                  <span>Hover to isolate & follow flow</span>
                </div>
                {activePalette.categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`legend-item ${hoveredCategory === cat.id ? 'active' : ''}`}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    title={cat.description}
                  >
                    <span
                      className="legend-color-dot"
                      style={{
                        backgroundColor: cat.color,
                        boxShadow: `0 0 8px ${cat.color}80`,
                      }}
                    />
                    <div className="legend-item-info">
                      <span className="legend-item-label">{cat.label}</span>
                      <span className="legend-item-desc">{cat.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Syntax Error Overlay */}
        {errorMsg && (
          <div className="canvas-error-badge">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-details">
              <strong>Diagram Syntax Error</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Floating Canvas Controls */}
        <div className="floating-canvas-controls" onMouseDown={(e) => e.stopPropagation()}>
          <div className="scale-indicator" title="Current zoom level">
            {Math.round(scale * 100)}%
          </div>
          <button className="canvas-tool-btn" onClick={zoomIn} title="Zoom In (or Scroll Wheel Up)">
            <ZoomIn size={17} />
          </button>
          <button className="canvas-tool-btn" onClick={zoomOut} title="Zoom Out (or Scroll Wheel Down)">
            <ZoomOut size={17} />
          </button>
          <button className="canvas-tool-btn" onClick={handleFitToScreen} title="Fit to Screen">
            <Maximize size={16} />
          </button>
          <button className="canvas-tool-btn" onClick={resetZoom} title="Reset Pan & Zoom (Double Click Canvas)">
            <RotateCcw size={15} />
          </button>
          <div className="canvas-drag-hint" title="Drag canvas to pan around">
            <Move size={14} />
          </div>
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="canvas-loading-tag">
            <span className="pulsing-dot" style={{ backgroundColor: theme.accentColor }} />
            Rendering...
          </div>
        )}
      </div>
    );
  }
);
