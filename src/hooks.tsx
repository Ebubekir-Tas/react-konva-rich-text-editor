import { useEditor } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { extensions, defaultToolbarOptions } from './constants';

interface UseRichTextEditorProps {
  text: string;
  setText: (value: string) => void;
  setSvgImage: (url: string) => void;
  fontSize: number;
  width?: number;
  height?: number;
  toolbarOptions?: string[];
  onUpdate?: ({ editor }: { editor: Editor }) => void;
}

export function useRichTextEditor(props: UseRichTextEditorProps) {
  const {
    text,
    setText,
    setSvgImage,
    fontSize,
    width = 360,
    height = 720,
    toolbarOptions,
    onUpdate,
  } = props;

  const editor = useEditor({
    extensions: extensions,
    content: text,
    onUpdate: onUpdate || undefined,
  });

  const options = toolbarOptions || defaultToolbarOptions;

  const updateSvg = useCallback(
    (html: string): string => {
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: ${fontSize}px; position: absolute; top: 0; left: 0; margin: 0; padding: 0; color: black;">
              <style>
                p { margin: 0; }
              </style>  
              ${html}
            </div>
          </foreignObject>
        </svg>`;

      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      return URL.createObjectURL(svgBlob);
    },
    [fontSize, height, width]
  );

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (editor) {
      if (!loaded) {
        const svgUrl = updateSvg(editor.getHTML());
        setSvgImage(svgUrl);
        setLoaded(true);
      }
      const handleUpdate = ({ editor }: { editor: Editor }) => {
        const svgUrl = updateSvg(editor.getHTML());
        setText(editor.getHTML());
        setSvgImage(svgUrl);
      };

      editor.on('update', handleUpdate);
      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor, setSvgImage, updateSvg, setText, loaded]);

  const editorRef = useRef<HTMLDivElement>(null);
  const bubbleMenuRef = useRef<HTMLElement | null>(null);

  const setBubbleMenuElement = (element: HTMLElement) => {
    bubbleMenuRef.current = element;
  };

  return {
    editor,
    editorRef,
    bubbleMenuRef,
    setBubbleMenuElement,
    options,
    updateSvg,
  };
}
