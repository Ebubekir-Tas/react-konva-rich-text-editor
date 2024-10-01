import React from 'react';
import { EditorContent } from '@tiptap/react';
import { useRichTextEditor } from '../hooks';
import Toolbar from './Toolbar';
import "../styles.css";

interface ExternalEditorProps {
  text: string;
  setText: (value: string) => void;
  setSvgImage: (url: string) => void;
  fontSize: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  toolbarOptions?: string[];
}

export const ExternalEditor: React.FC<ExternalEditorProps> = (props) => {
  const {
    style,
  } = props;

  const {
    editor,
    editorRef,
    setBubbleMenuElement,
    options,
  } = useRichTextEditor(props);

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
