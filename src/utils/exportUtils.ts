/**
 * Utilities for exporting Mermaid diagrams to SVG and high-resolution PNG
 */

export const exportSvg = (svgElement: SVGElement, filename = 'mermaid-diagram.svg') => {
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copySvgToClipboard = async (svgElement: SVGElement): Promise<boolean> => {
  if (!svgElement) return false;
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    await navigator.clipboard.writeText(svgData);
    return true;
  } catch (err) {
    console.error('Failed to copy SVG', err);
    return false;
  }
};

export const exportPng = async (
  svgElement: SVGElement,
  bgColor: string = '#090814',
  filename = 'mermaid-diagram.png',
  scaleMultiplier = 3
): Promise<boolean> => {
  if (!svgElement) return false;

  return new Promise((resolve) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const bbox = svgElement.getBoundingClientRect();
        // Fallback dimensions if bbox is 0
        const width = (bbox.width > 0 ? bbox.width : 800) * scaleMultiplier;
        const height = (bbox.height > 0 ? bbox.height : 600) * scaleMultiplier;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }

        // Draw background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // Draw image scaled
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            resolve(true);
          } else {
            resolve(false);
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    } catch (err) {
      console.error('Failed to export PNG', err);
      resolve(false);
    }
  });
};

export const copyPngToClipboard = async (
  svgElement: SVGElement,
  bgColor: string = '#090814',
  scaleMultiplier = 2
): Promise<boolean> => {
  if (!svgElement || !navigator.clipboard || !window.ClipboardItem) return false;

  return new Promise((resolve) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const bbox = svgElement.getBoundingClientRect();
        const width = (bbox.width > 0 ? bbox.width : 800) * scaleMultiplier;
        const height = (bbox.height > 0 ? bbox.height : 600) * scaleMultiplier;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
              ]);
              resolve(true);
            } catch (copyErr) {
              console.error('Clipboard copy image failed', copyErr);
              resolve(false);
            }
          } else {
            resolve(false);
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    } catch (err) {
      console.error('Failed to copy PNG', err);
      resolve(false);
    }
  });
};
