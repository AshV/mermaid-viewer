import { useState } from 'react';
import { Download, Copy, Moon, Sun, Check, Activity } from 'lucide-react';
import { Mermaid } from './components/Mermaid';

const DEFAULT_CODE = `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [theme, setTheme] = useState<'dark' | 'default'>('dark');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    showNotification('Code copied to clipboard!');
  };

  const downloadSvg = () => {
    const svgElement = document.querySelector('.mermaid-container svg');
    if (!svgElement) {
      showNotification('No SVG to download');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mermaid-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('SVG Downloaded!');
  };

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'default' : 'dark');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <Activity size={24} />
          Mermaid Studio Pro
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Canvas: Light' : 'Canvas: Dark'}
          </button>
          <button className="btn btn-primary" onClick={downloadSvg} disabled={!!errorMsg}>
            <Download size={16} />
            Export SVG
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="pane editor-pane">
          <div className="pane-header">
            <span>Editor</span>
            <div className="toolbar">
              <button className="icon-btn" onClick={copyCode} title="Copy Code">
                <Copy size={16} />
              </button>
            </div>
          </div>
          <textarea
            className="editor-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Enter Mermaid syntax here..."
          />
        </div>

        <div className="pane viewer-pane">
          <div className="pane-header">
            <span>Preview</span>
          </div>
          <Mermaid 
            code={code} 
            theme={theme}
            onError={setErrorMsg}
          />
        </div>
      </main>

      <div className={`toast ${showToast ? 'show' : ''}`}>
        <Check size={16} className="text-green-500" />
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
