import { useState } from 'react';

interface UseRichTextProps {
  initialText?: string;
  fontSize?: number;
  width?: number;
  height?: number;
}

export function useRichText({
  initialText = '',
  fontSize = 16,
  width = 360,
  height = 720,
}: UseRichTextProps) {
  const [text, setText] = useState(initialText);
  const [svgImage, setSvgImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });

  return {
    text,
    setText,
    svgImage,
    setSvgImage,
    isEditing,
    setIsEditing,
    editorPosition,
    setEditorPosition,
    fontSize,
    width,
    height,
  };
}
