import { EditorEl } from "./types";

export const generateSvgFromHtml = (
  html: string,
  editorEl: EditorEl,
  editorStyle?: React.CSSProperties,
): string => {

  const defaultStyle: React.CSSProperties = {
    fontSize: `${editorEl.fontSize || 12}px`,
    color: 'black',
    fontFamily: 'Arial',
    fontWeight: '400',
    width: `${editorEl.width}px`,
    height: `${editorEl.height}px`,
    margin: '0',
    padding: '0',
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    lineHeight: '1.2',
  };

  const mergedStyle = { ...defaultStyle, ...editorStyle };

  const inlineStyle = Object.entries(mergedStyle)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${value};`)
    .join(' ');

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${editorEl.width}" height="${
    editorEl.height
  }" viewBox="0 0 ${editorEl.width} ${editorEl.height}" preserveAspectRatio="none">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="${inlineStyle}">
          <style>
            p { margin: 0; }
          </style>
          ${html}
        </div>
      </foreignObject>
    </svg>`;

  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(svgBlob);

  return blobUrl;
};
