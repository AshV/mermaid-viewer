import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

interface MermaidProps {
  code: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
  onError?: (error: string | null) => void;
}

export const Mermaid: React.FC<MermaidProps> = ({ code, theme = 'dark', onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgCode, setSvgCode] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });
  }, [theme]);

  useEffect(() => {
    const renderChart = async () => {
      try {
        if (!code.trim()) {
          setSvgCode('');
          setErrorMsg(null);
          if (onError) onError(null);
          return;
        }

        const id = `mermaid-chart-${Date.now()}`;
        const { svg } = await mermaid.render(id, code);
        setSvgCode(svg);
        setErrorMsg(null);
        if (onError) onError(null);
      } catch (error: any) {
        // mermaid usually throws strings or objects with message
        const msg = error?.message || error?.str || 'Syntax error in Mermaid code';
        setErrorMsg(msg);
        if (onError) onError(msg);
      }
    };

    const timeoutId = setTimeout(renderChart, 300); // Debounce rendering
    return () => clearTimeout(timeoutId);
  }, [code, onError]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.2));
  const handleResetZoom = () => setScale(1);

  return (
    <div className={`viewer-content ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div 
        ref={containerRef}
        className="mermaid-container"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: '100%',
          minHeight: '100%'
        }}
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
      
      {errorMsg && (
        <div className="error-container">
          <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="viewer-controls">
        <button onClick={handleZoomIn} title="Zoom In"><ZoomIn size={18} /></button>
        <button onClick={handleResetZoom} title="Reset Zoom"><RefreshCcw size={16} /></button>
        <button onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={18} /></button>
      </div>
    </div>
  );
};
