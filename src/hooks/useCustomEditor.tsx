import { useState, useEffect, useRef } from 'react';
import { useEditor, Editor } from '@tiptap/react';
import { generateSvgFromHtml } from '../utils';
import { extensions, CustomParagraph } from '../constants';

interface UseCustomEditorProps {
  initialText: string;
  setText: (text: string) => void;
  editorEl: any;
  setSvgImage: (url: string) => void;
  onUpdate?: ({ editor }: { editor: any }) => void;
}

export function useCustomEditor({
  initialText,
  setText,
  editorEl,
  setSvgImage,
  onUpdate,
}: UseCustomEditorProps) {
  const [loaded, setLoaded] = useState(false);

  const editor = useEditor({
    extensions: [...extensions, CustomParagraph],
    content: initialText,
    onUpdate,
  });

  useEffect(() => {
    if (!editor) return;

    const updateSvgImage = (html: string) => {
      const dataUrl = generateSvgFromHtml(html, editorEl);
      setSvgImage(dataUrl);
    };

    if (!loaded) {
      updateSvgImage(editor.getHTML());
      setLoaded(true);
    }

    const handleUpdate = ({ editor }: { editor: Editor }) => {
      const updatedText = editor.getHTML();
      setText(updatedText);
      updateSvgImage(updatedText);
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, loaded]);

  return editor;
}