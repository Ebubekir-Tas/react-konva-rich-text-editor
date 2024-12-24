import { useState, useEffect, useRef } from 'react';
import { useEditor, Editor } from '@tiptap/react';

interface UseEditorWithSVGUpdateProps {
  initialText: string;
  setText: (text: string) => void;
  editorEl: any;
  extensions: any[];
  generateSvg: (html: string) => string;
}

export function useEditorWithSVGUpdate({
  initialText,
  setText,
  editorEl,
  extensions,
  generateSvg,
}: UseEditorWithSVGUpdateProps) {
  const [loaded, setLoaded] = useState(false);
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const previousSvgUrlRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions,
    content: initialText,
  });

  useEffect(() => {
    if (!editor) return;

    if (!loaded) {
      const svg = generateSvg(editor.getHTML());
      setSvgUrl(svg);
      setLoaded(true);
    }

    const handleUpdate = ({ editor }: { editor: Editor }) => {
      const updatedText = editor.getHTML();
      setText(updatedText);
      const svg = generateSvg(updatedText);
      setSvgUrl(svg);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, loaded, generateSvg]);

  // Handle SVG URL cleanup
  useEffect(() => {
    if (previousSvgUrlRef.current && previousSvgUrlRef.current !== svgUrl) {
      URL.revokeObjectURL(previousSvgUrlRef.current);
    }
    previousSvgUrlRef.current = svgUrl;

    return () => {
      if (previousSvgUrlRef.current) {
        URL.revokeObjectURL(previousSvgUrlRef.current);
      }
    };
  }, [svgUrl]);

  return { editor, svgUrl };
}