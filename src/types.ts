import type { Image as KonvaImageType, ImageConfig } from "konva/lib/shapes/Image";
import type { CSSProperties, Dispatch, SetStateAction } from "react";
import type { UseEditorOptions } from '@tiptap/react';

export interface EditorEl {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  content: string;
  open?: boolean;
}

export interface RichTextProps extends Omit<Partial<ImageConfig>, 'image'> {
  svgImage: string;
  handleDblClick?: (event?: any) => void;
  setKonvaImageNode?: (node: KonvaImageType) => void;
}

export type ToolbarOption =
  | 'undo'
  | 'redo'
  | 'bold'
  | 'underline'
  | 'italic'
  | 'strike'
  | 'fontFamily'
  | 'color';

export interface EditorProps {
  editorEl: EditorEl;
  setEditorEl: Dispatch<SetStateAction<EditorEl>>;
  editorProps?: UseEditorOptions;

  editorStyle?: CSSProperties;
  toolbarStyle?: CSSProperties;
  style?: CSSProperties;
  readOnly?: boolean;

  toolbarOptions?: ToolbarOption[];

  [key: string]: any;
};
