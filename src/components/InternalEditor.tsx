import React, { Dispatch, SetStateAction, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import Toolbar from './toolbar';
import { defaultToolbarOptions } from '../constants';
import { EditorEl } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';
import { useCustomEditor } from '../hooks/useCustomEditor';
import { useHandleDrag } from '../hooks/useHandleDrag';
import { generateSvgFromHtml } from '../utils';

interface InternalEditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  editorEl: EditorEl;
  setEditorEl: Dispatch<SetStateAction<EditorEl>>;
  setSvgImage: Dispatch<SetStateAction<string>>;
  style?: React.CSSProperties;
  editorStyle?: React.CSSProperties;
  toolbarStyle?: React.CSSProperties;
  toolbarOptions?: string[];
}

export const InternalEditor: React.FC<InternalEditorProps> = (props) => {
  const {
    text,
    setText,
    editorEl,
    setEditorEl,
    setSvgImage,
    style,
    toolbarOptions,
    editorStyle,
    toolbarStyle,
  } = props;

  const { fontSize = 12 } = editorEl;

  const editorRef = useRef<HTMLDivElement>(null);
  const bubbleMenuRef = useRef<HTMLElement | null>(null);

  const options = toolbarOptions && toolbarOptions.length > 0 ? toolbarOptions : defaultToolbarOptions;

  const setBubbleMenuElement = (element: HTMLElement) => {
    bubbleMenuRef.current = element;
  };

  const editor = useCustomEditor({
    editorEl,
    setSvgImage,
    editorOptions: {}
  });

  useClickOutside({
    isOpen: editorEl.open,
    editorRef,
    bubbleMenuRef,
    onClose: () => {
      setEditorEl((prev) => ({ ...prev, open: false }));
      if (editor) {
        const updatedText = editor.getHTML();
        setText(updatedText);
        const svgUrl = generateSvgFromHtml(updatedText, editorEl);
        setSvgImage(svgUrl);
      }
    },
  });

  // Use the custom hook for dragging
  const { handleMouseDown } = useHandleDrag({
    editorEl,
    setEditorEl,
    containerSelector: '.konvajs-content',
  });

  if (!editorEl.open || !editor) {
    return null;
  }

  return (
    <div
      ref={editorRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        top: editorEl.y,
        left: editorEl.x,
        width: editorEl.width,
        height: editorEl.height,
        border: '2px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        cursor: 'move',
        ...style,
      }}
    >
      <Toolbar
        editor={editor}
        options={options}
        setBubbleMenuElement={setBubbleMenuElement}
        toolbarStyle={toolbarStyle}
      />
      {!editor.isDestroyed && (
        <EditorContent
          editor={editor}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            fontSize: `${fontSize}px`,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            cursor: 'text',
            ...editorStyle,
          }}
        />
      )}
    </div>
  );
};
