import { useState, useRef, useEffect } from 'react';
import { 
  ClipboardPaste, 
  Download, 
  Copy, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { MermaidViewer, type MermaidViewerRef } from './components/Mermaid';
import { THEMES, type DiagramTheme } from './themes';
import { SAMPLES, type DiagramSample } from './samples';
import { exportSvg, exportPng, copyPngToClipboard, copySvgToClipboard } from './utils/exportUtils';

export default function App() {
  const [code, setCode] = useState<string>(SAMPLES[0].code);
  const [selectedTheme, setSelectedTheme] = useState<DiagramTheme>(THEMES[0]);
  const [isEditorExpanded, setIsEditorExpanded] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  const viewerRef = useRef<MermaidViewerRef>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showNotification = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = window.setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setCode(text);
        showNotification('Successfully pasted diagram from clipboard! ✨');
        // Fit to screen after pasting new diagram
        setTimeout(() => {
          viewerRef.current?.fitToScreen();
        }, 300);
      } else {
        showNotification('Clipboard is empty or contains no text');
      }
    } catch {
      // Browser permissions prompt fallback
      textareaRef.current?.focus();
      textareaRef.current?.select();
      showNotification('Press Ctrl+V (or Cmd+V) to paste directly into the box');
    }
  };

  const handleSelectSample = (sample: DiagramSample) => {
    setCode(sample.code);
    setShowSamplesMenu(false);
    showNotification(`Loaded "${sample.title}" sample! 🚀`);
    setTimeout(() => {
      viewerRef.current?.fitToScreen();
    }, 300);
  };

  const handleClear = () => {
    setCode('');
    showNotification('Cleared editor');
  };

  const handleCopyCode = async () => {
    if (!code.trim()) {
      showNotification('Nothing to copy!');
      return;
    }
    await navigator.clipboard.writeText(code);
    showNotification('Mermaid code copied to clipboard! 📋');
  };

  const handleExportSvg = () => {
    const svgEl = viewerRef.current?.getSvgElement();
    if (!svgEl) {
      showNotification('No diagram rendered to export');
      return;
    }
    exportSvg(svgEl, 'mermaid-diagram.svg');
    showNotification('Downloaded SVG vector! 🎨');
    setShowExportMenu(false);
  };

  const handleExportPng = async () => {
    const svgEl = viewerRef.current?.getSvgElement();
    if (!svgEl) {
      showNotification('No diagram rendered to export');
      return;
    }
    showNotification('Generating high-res PNG...');
    const ok = await exportPng(svgEl, selectedTheme.canvasBg, 'mermaid-diagram.png', 3);
    if (ok) {
      showNotification('Downloaded high-resolution PNG! 🖼️');
    } else {
      showNotification('Failed to generate PNG image');
    }
    setShowExportMenu(false);
  };

  const handleCopyPng = async () => {
    const svgEl = viewerRef.current?.getSvgElement();
    if (!svgEl) {
      showNotification('No diagram rendered to copy');
      return;
    }
    showNotification('Copying PNG image...');
    const ok = await copyPngToClipboard(svgEl, selectedTheme.canvasBg, 2);
    if (ok) {
      showNotification('PNG copied to clipboard! Ready to paste into Slack/Docs 📋');
    } else {
      showNotification('Browser did not allow clipboard image copy');
    }
    setShowExportMenu(false);
  };

  const handleCopySvg = async () => {
    const svgEl = viewerRef.current?.getSvgElement();
    if (!svgEl) {
      showNotification('No diagram rendered to copy');
      return;
    }
    const ok = await copySvgToClipboard(svgEl);
    if (ok) {
      showNotification('SVG XML markup copied to clipboard! 📋');
    }
    setShowExportMenu(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Diagram format tag
  const getDiagramTag = () => {
    if (!code.trim()) return null;
    const match = code.trim().match(/^([a-zA-Z0-9_-]+)/);
    return match ? match[1] : 'diagram';
  };

  const diagramTag = getDiagramTag();

  return (
    <div className={`app-shell theme-${selectedTheme.id}`}>
      {/* Top Navigation Bar */}
      <header className="app-topbar">
        <div className="topbar-branding">
          <div className="logo-sparkle" style={{ background: selectedTheme.accentColor }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">Mermaid Studio</span>
            <span className="brand-tagline">Pro Viewer</span>
          </div>
          {diagramTag && (
            <span className="diagram-badge" style={{ borderColor: `${selectedTheme.accentColor}50`, color: selectedTheme.accentColor }}>
              🏷️ {diagramTag}
            </span>
          )}
        </div>

        {/* Theme Pills */}
        <div className="theme-selector-group">
          <span className="theme-group-label">Palette:</span>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={`theme-chip-btn ${selectedTheme.id === theme.id ? 'active' : ''}`}
              style={{
                borderColor: selectedTheme.id === theme.id ? theme.accentColor : 'transparent',
              }}
              onClick={() => setSelectedTheme(theme)}
              title={theme.name}
            >
              <span className="theme-color-dot" style={{ backgroundColor: theme.accentColor }} />
              <span className="theme-chip-text">{theme.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Export & Utility Actions */}
        <div className="topbar-actions">
          {/* Samples Dropdown */}
          <div className="relative-menu">
            <button
              className="action-btn action-btn-secondary"
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              title="Browse diagram templates"
            >
              <Sparkles size={15} style={{ color: selectedTheme.accentColor }} />
              <span>Samples</span>
              <ChevronDown size={14} />
            </button>

            {showSamplesMenu && (
              <div className="dropdown-flyout samples-dropdown">
                <div className="dropdown-header">✨ Sample Presets</div>
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    className="dropdown-item"
                    onClick={() => handleSelectSample(sample)}
                  >
                    <span className="sample-icon">{sample.icon}</span>
                    <span className="sample-title">{sample.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Menu */}
          <div className="relative-menu">
            <button
              className="action-btn action-btn-primary"
              style={{
                background: `linear-gradient(135deg, ${selectedTheme.accentColor}, #8b5cf6)`,
              }}
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export diagram"
            >
              <Download size={15} />
              <span>Export</span>
              <ChevronDown size={14} />
            </button>

            {showExportMenu && (
              <div className="dropdown-flyout export-dropdown">
                <div className="dropdown-header">🎨 Export Diagram</div>
                <button className="dropdown-item" onClick={handleExportSvg}>
                  <FileCode size={16} />
                  <div>
                    <div className="dropdown-item-title">Download SVG</div>
                    <div className="dropdown-item-desc">Infinite vector resolution</div>
                  </div>
                </button>
                <button className="dropdown-item" onClick={handleExportPng}>
                  <ImageIcon size={16} />
                  <div>
                    <div className="dropdown-item-title">Download PNG</div>
                    <div className="dropdown-item-desc">Ultra High-DPI (3x)</div>
                  </div>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={handleCopyPng}>
                  <Copy size={16} />
                  <div>
                    <div className="dropdown-item-title">Copy Image to Clipboard</div>
                    <div className="dropdown-item-desc">Paste directly into apps</div>
                  </div>
                </button>
                <button className="dropdown-item" onClick={handleCopySvg}>
                  <Share2 size={16} />
                  <div>
                    <div className="dropdown-item-title">Copy SVG Code</div>
                    <div className="dropdown-item-desc">Raw XML vector string</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            className="action-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Main Full-Viewport Viewer Canvas */}
      <main className="viewer-main-canvas" onClick={() => {
        if (showExportMenu) setShowExportMenu(false);
        if (showSamplesMenu) setShowSamplesMenu(false);
      }}>
        <MermaidViewer
          ref={viewerRef}
          code={code}
          theme={selectedTheme}
          onScaleChange={setZoomScale}
        />
      </main>

      {/* Compact Smart Input Panel (Viewer-First Focus) */}
      <footer className={`smart-input-drawer ${isEditorExpanded ? 'expanded' : 'compact'}`}>
        <div className="drawer-handle-bar">
          <div className="drawer-left-controls">
            {/* Primary Glowing One-Click Paste Button */}
            <button
              className="quick-paste-btn"
              onClick={handlePasteClipboard}
              title="Paste Mermaid code from system clipboard"
            >
              <ClipboardPaste size={17} />
              <span>Paste from Clipboard</span>
            </button>

            <button
              className="drawer-mini-btn"
              onClick={handleCopyCode}
              title="Copy current Mermaid syntax"
            >
              <Copy size={14} />
              <span>Copy Code</span>
            </button>

            <button
              className="drawer-mini-btn drawer-mini-danger"
              onClick={handleClear}
              title="Clear diagram"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>

          <div className="drawer-stats">
            <span className="stat-pill">{code.trim().split('\n').filter(Boolean).length} lines</span>
            <span className="stat-pill">{code.length} chars</span>
            <span className="stat-pill zoom-pill">{Math.round(zoomScale * 100)}% zoom</span>

            <button
              className="drawer-toggle-btn"
              onClick={() => setIsEditorExpanded(!isEditorExpanded)}
              title={isEditorExpanded ? 'Minimize editor textarea' : 'Expand editor textarea'}
            >
              {isEditorExpanded ? (
                <>
                  <ChevronDown size={15} />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <ChevronUp size={15} />
                  <span>Edit Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Small, Non-intrusive Textarea */}
        <div className="drawer-textarea-container">
          <textarea
            ref={textareaRef}
            className="compact-mermaid-textarea"
            rows={isEditorExpanded ? 8 : 2}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste Mermaid syntax here or type (e.g., flowchart TD, sequenceDiagram, gitGraph)..."
            spellCheck={false}
          />
        </div>
      </footer>

      {/* Toast Notification */}
      <div className={`floating-toast ${showToast ? 'visible' : ''}`}>
        <Check size={16} className="toast-check" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
