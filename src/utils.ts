import { EditorEl } from "./types";

export const generateSvgFromHtml = (
  html: string,
  editorEl: EditorEl
): string => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${editorEl.width}" height="${
    editorEl.height
  }" viewBox="0 0 ${editorEl.width} ${
    editorEl.height
  }" preserveAspectRatio="none">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          font-size: ${editorEl?.fontSize || 12}px;
          color: black;
          font-family: 'Arial';
          width: ${editorEl.width}px;
          height: ${editorEl.height}px;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        ">
          <style>
            p { margin: 0; }
          </style>
          ${html}
        </div>
      </foreignObject>
    </svg>`;
  
  // Encode the SVG string into a Data URL
  const encodedSvg = encodeURIComponent(svgString)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

  return dataUrl;
};
