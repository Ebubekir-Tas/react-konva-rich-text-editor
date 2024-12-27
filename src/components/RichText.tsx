import React from 'react';
import Image from './KonvaImage';
import { EditorEl } from '../types';
import { EditorOptions } from '@tiptap/core';

type EditorType = 'inline' | 'internal' | 'external';

interface RichTextProps {
  editorType?: EditorType;

  editorEl: EditorEl;
  setEditorEl: React.Dispatch<
    React.SetStateAction<EditorEl>
  >;

  editorProps?: Partial<EditorOptions>

  readOnly?: boolean;
  placeholder?: string;
  draggable?: boolean;
  editorStyle?: React.CSSProperties;
  toolbarStyle?: React.CSSProperties;
  [key: string]: any;
}

export function RichText({
  editorType = 'inline',
  editorEl,
  setEditorEl,
  editorProps,
  readOnly = false,
  placeholder,
  draggable = false,
  editorStyle,
  toolbarStyle,
  ...restProps
}: RichTextProps) {
  // Decide which "editor + image" to render
  switch (editorType) {
    case 'internal':
      return (
        //@ts-ignore
        <Image.Internal
          editorEl={editorEl}
          setEditorEl={setEditorEl}

          readOnly={readOnly}
          placeholder={placeholder}
          editorStyle={editorStyle}
          toolbarStyle={toolbarStyle}
          draggable={draggable}
          {...restProps}
        />
      );

    case 'external':
      return (
        //@ts-ignore
        <Image.External
          editorEl={editorEl}
          setEditorEl={setEditorEl}
          readOnly={readOnly}
          placeholder={placeholder}
          editorStyle={editorStyle}
          toolbarStyle={toolbarStyle}
          draggable={draggable}
          {...restProps}
        />
      );

    case 'inline':
    default:
      return (
        <Image.Inline
          editorEl={editorEl}
          setEditorEl={setEditorEl}
          editorProps={editorProps}
          readOnly={readOnly}
          placeholder={placeholder}
          editorStyle={editorStyle}
          toolbarStyle={toolbarStyle}
          draggable={draggable}
          {...restProps}
        />
      );
  }
}
