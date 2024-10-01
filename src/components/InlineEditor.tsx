import React, { useEffect, useRef, CSSProperties } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from './Toolbar';
import { useRichTextEditor } from '../hooks';
import '../styles.css';

interface InlineEditorProps {
  text: string;
  setText: (value: string) => void;
  setSvgImage: (url: string) => void;
  fontSize: number;
  width?: number;
  height?: number;
  style?: CSSProperties;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  toolbarOptions?: string[];
}

export const InlineEditor: React.FC<InlineEditorProps> = (props) => {
  const {
    text,
    setText,
    setSvgImage,
    style,
    isEditing,
    setIsEditing,
  } = props;

  const {
    editor,
    editorRef,
    bubbleMenuRef,
    setBubbleMenuElement,
    options,
    updateSvg,
  } = useRichTextEditor({
      ...props,
      onUpdate: ({ editor }) => {
        if (isFirstUpdate.current) {
          isFirstUpdate.current = false;
          return;
        }
        const svgUrl = updateSvg(editor.getHTML());
        setText(editor.getHTML());
        setSvgImage(svgUrl);
      },
    });

  const isFirstUpdate = useRef(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        bubbleMenuRef.current &&
        !bubbleMenuRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
        setText(text);
        const svgUrl = updateSvg(text);
        setSvgImage(svgUrl);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, text, updateSvg, setIsEditing, setSvgImage, setText]);

  if (!editor) {
    return null;
  }

  return (
    <div ref={editorRef} style={style}>
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
