import React, { useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from './Toolbar';
import { useRichTextEditor } from '../hooks';

interface InternalEditorProps {
  text: string;
  setText: (value: string) => void;
  setSvgImage: (url: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editorPosition: { x: number; y: number };
  fontSize?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  toolbarOptions?: string[];
}

export const InternalEditor: React.FC<InternalEditorProps> = (props) => {
  const {
    text,
    setText,
    setSvgImage,
    isEditing,
    setIsEditing,
    editorPosition,
    fontSize = 16,
    width = 360,
    height = 720,
    style,
    toolbarOptions,
  } = props;

  const {
    editor,
    editorRef,
    bubbleMenuRef,
    setBubbleMenuElement,
    options,
    updateSvg,
  } = useRichTextEditor({
    text,
    setText,
    setSvgImage,
    fontSize,
    width,
    height,
    toolbarOptions,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
				editor &&
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        (!bubbleMenuRef.current || !bubbleMenuRef.current.contains(event.target as Node))
      ) {
        setIsEditing(false);
        const updatedText = editor.getHTML();
        setText(updatedText);
        const svgUrl = updateSvg(updatedText);
        setSvgImage(svgUrl);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editor, setIsEditing, setText, updateSvg, setSvgImage]);

  if (!isEditing || !editor) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      style={{
        position: 'absolute',
        top: editorPosition.y,
        left: editorPosition.x,
        zIndex: 9999,
        ...style,
      }}
    >
      <Toolbar
        editor={editor}
        options={options}
        setBubbleMenuElement={setBubbleMenuElement}
      />
      {!editor.isDestroyed && (
        <EditorContent className="editor-content" editor={editor} />
      )}
    </div>
  );
};
